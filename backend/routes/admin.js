const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// --- PRODUCTOS ---

// GET /api/admin/productos
router.get('/productos', async (req, res) => {
    try {
        const [productos] = await db.execute('SELECT * FROM productos ORDER BY id ASC');
        res.json(productos);
    } catch (error) {
        console.error('Admin Products DB Error:', error);
        res.status(500).json({ error: 'Error al obtener productos de la base de datos' });
    }
});

// POST /api/admin/productos/:id/stock-adjust
router.post('/productos/:id/stock-adjust', async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, cantidad, nota } = req.body;

        if (!['entrada', 'salida'].includes(tipo) || !cantidad) {
            return res.status(400).json({ error: 'Datos inválidos' });
        }

        try {
            const [prod] = await db.execute('SELECT nombre, stock FROM productos WHERE id = ?', [id]);
            if (prod.length === 0) return res.status(404).json({ error: 'No encontrado' });

            const nuevoStock = tipo === 'entrada' ? prod[0].stock + cantidad : prod[0].stock - cantidad;
            await db.execute('UPDATE productos SET stock = ? WHERE id = ?', [nuevoStock, id]);
            await db.execute(
                'INSERT INTO movimientos_inventario (producto_id, nombre_producto, tipo, cantidad, nota) VALUES (?, ?, ?, ?, ?)',
                [id, prod[0].nombre, tipo, cantidad, nota || 'Ajuste manual']
            );
            return res.json({ message: 'OK', nuevoStock });
        } catch (dbErr) {
            console.error('Error al hacer ajuste de stock:', dbErr);
            return res.status(500).json({ error: 'Error en base de datos al ajustar stock' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
});

// PATCH /api/admin/productos/:id/stock — actualización directa
router.patch('/productos/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        if (stock === undefined || stock < 0) return res.status(400).json({ error: 'Stock inválido' });

        try {
            const [prod] = await db.execute('SELECT nombre, stock FROM productos WHERE id = ?', [id]);
            if (prod.length === 0) return res.status(404).json({ error: 'No encontrado' });

            const diff = stock - prod[0].stock;
            if (diff !== 0) {
                await db.execute('UPDATE productos SET stock = ? WHERE id = ?', [stock, id]);
                await db.execute(
                    'INSERT INTO movimientos_inventario (producto_id, nombre_producto, tipo, cantidad, nota) VALUES (?, ?, ?, ?, ?)',
                    [id, prod[0].nombre, diff > 0 ? 'entrada' : 'salida', Math.abs(diff), 'Ajuste stock directo']
                );
            }
            res.json({ message: 'OK', nuevoStock: stock });
        } catch (dbErr) {
            console.error('Error al actualizar stock directo:', dbErr);
            res.status(500).json({ error: 'Error en base de datos al actualizar stock' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
});

// --- PEDIDOS ---

// GET /api/admin/pedidos
router.get('/pedidos', async (req, res) => {
    try {
        const [pedidos] = await db.execute(`
            SELECT p.*, u.nombre AS cliente_nombre, u.email AS cliente_email
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.creado_en DESC
        `);
        for (const p of pedidos) {
            const [det] = await db.execute('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [p.id]);
            p.detalle = det;
        }
        res.json(pedidos);
    } catch (error) {
        console.error('Admin Orders DB Error:', error);
        res.status(500).json({ error: 'Error al obtener pedidos de la base de datos' });
    }
});

// PUT /api/admin/pedidos/:id/status
router.put('/pedidos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        try {
            await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
            res.json({ message: 'OK' });
        } catch (dbErr) {
            console.error('Error al actualizar estado:', dbErr);
            res.status(500).json({ error: 'Error en base de datos al actualizar estado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
});

// --- REPORTES ---

// GET /api/admin/reportes/ventas
router.get('/reportes/ventas', async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        let dateCondition = "WHERE estado != 'Cancelado'";
        const params = [];

        if (desde && hasta) {
            dateCondition += " AND creado_en BETWEEN ? AND ?";
            params.push(`${desde} 00:00:00`, `${hasta} 23:59:59`);
        }

        const [totalGeneral] = await db.execute(`SELECT COUNT(*) AS total_pedidos, SUM(total) AS ingresos_totales FROM pedidos ${dateCondition}`, params);
        const [porDia] = await db.execute(`SELECT DATE(creado_en) AS fecha, SUM(total) AS ingresos, COUNT(*) AS pedidos FROM pedidos ${dateCondition} GROUP BY fecha ORDER BY fecha DESC LIMIT 30`, params);
        const [porMes] = await db.execute(`SELECT DATE_FORMAT(creado_en, '%Y-%m') AS mes, SUM(total) AS ingresos, COUNT(*) AS pedidos FROM pedidos ${dateCondition} GROUP BY mes ORDER BY mes DESC LIMIT 12`, params);
        const [porAno] = await db.execute(`SELECT YEAR(creado_en) AS ano, SUM(total) AS ingresos, COUNT(*) AS pedidos FROM pedidos ${dateCondition} GROUP BY ano ORDER BY ano DESC`, params);

        // Top productos (siempre se filtra por fecha si existe)
        let topQuery = `
            SELECT dp.nombre_producto, SUM(dp.cantidad) AS unidades_vendidas 
            FROM detalle_pedido dp
            JOIN pedidos p ON dp.pedido_id = p.id
            ${dateCondition}
            GROUP BY dp.nombre_producto 
            ORDER BY unidades_vendidas DESC
            LIMIT 5
        `;
        const [topProductos] = await db.execute(topQuery, params);

        // Ventas individuales
        const [individual] = await db.execute(`
            SELECT p.id, p.creado_en, p.total, p.estado, p.metodo_pago, u.nombre AS cliente_nombre
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ${dateCondition}
            ORDER BY p.creado_en DESC
        `, params);

        res.json({
            totalGeneral: totalGeneral[0] || { total_pedidos: 0, ingresos_totales: 0 },
            porDia: porDia || [],
            porMes: porMes || [],
            porAno: porAno || [],
            topProductos: topProductos || [],
            individual: individual || []
        });
    } catch (error) {
        console.error('Admin Stats DB Error:', error);
        res.status(500).json({ error: 'Error al obtener reportes de ventas' });
    }
});

// GET /api/admin/reportes/inventario
router.get('/reportes/inventario', async (req, res) => {
    try {
        const [movimientos] = await db.execute(`SELECT * FROM movimientos_inventario ORDER BY fecha DESC LIMIT 100`);
        const [stockActual] = await db.execute(`SELECT id, nombre, stock FROM productos`);
        res.json({ movimientos, stockActual });
    } catch (error) {
        console.error('Admin Inv DB Error:', error);
        res.status(500).json({ error: 'Error al obtener reportes de inventario' });
    }
});

module.exports = router;
