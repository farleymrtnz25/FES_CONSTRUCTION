const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Ladrillos, bloques y materiales de construcción están EXCLUIDOS de IVA
// según el Art. 424 del Estatuto Tributario colombiano (E.T.)
// El ICA es un impuesto al comerciante (municipal), no se cobra al cliente en la factura.

// POST /api/pedidos — crear pedido
router.post('/', authMiddleware, async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { productos, metodo_pago = 'WhatsApp', notas = '', tipo_persona = 'Natural' } = req.body;
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ error: 'El pedido debe incluir al menos un producto' });
        }

        const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const iva = 0; // Excluido de IVA - Art. 424 E.T. (ladrillos, bloques, materiales de construcción)
        const ica = 0; // ICA no aplica al consumidor final en la factura
        const total = subtotal;

        const [pedidoResult] = await conn.execute(
            'INSERT INTO pedidos (usuario_id, tipo_persona, subtotal, iva, ica, total, metodo_pago, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, tipo_persona, subtotal, iva, ica, total, metodo_pago, notas]
        );
        const pedidoId = pedidoResult.insertId;

        for (const item of productos) {
            const lineSubtotal = item.precio * item.cantidad;
            await conn.execute(
                'INSERT INTO detalle_pedido (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                [pedidoId, item.id, item.nombre, item.precio, item.cantidad, lineSubtotal]
            );
            // Log movimiento de inventario (salida)
            await conn.execute(
                'INSERT INTO movimientos_inventario (producto_id, nombre_producto, tipo, cantidad, nota) VALUES (?, ?, ?, ?, ?)',
                [item.id, item.nombre, 'salida', item.cantidad, `Pedido #${pedidoId}`]
            );
            // Reducir stock
            await conn.execute(
                'UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?',
                [item.cantidad, item.id]
            );
        }

        await conn.commit();
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido: { id: pedidoId, subtotal, iva, ica, total, metodo_pago, estado: 'Pendiente', tipo_persona }
        });
    } catch (error) {
        await conn.rollback();
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error al procesar el pedido' });
    } finally {
        conn.release();
    }
});

// GET /api/pedidos/mis-pedidos — historial del usuario autenticado
router.get('/mis-pedidos', authMiddleware, async (req, res) => {
    try {
        const [pedidos] = await db.execute(
            'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC',
            [req.user.id]
        );
        for (const p of pedidos) {
            const [detalle] = await db.execute('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [p.id]);
            p.detalle = detalle;
        }
        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

module.exports = router;
