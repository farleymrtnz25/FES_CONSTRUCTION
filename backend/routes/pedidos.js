const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/pedidos — Registrar nuevo pedido y descontar inventario
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      cliente_nombre,
      cliente_telefono,
      cliente_direccion,
      ciudad,
      notas,
      metodo_pago,
      productos, // Array de { id, nombre, precio, cantidad }
      total
    } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos' });
    }

    // Identificar si viene autenticado
    let usuario_id = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        usuario_id = decoded.id;
      } catch (err) {
        // Usuario invitado
      }
    }

    const totalNum = Number(total) || productos.reduce((acc, p) => acc + (Number(p.precio) * (Number(p.cantidad) || 1)), 0);
    const subtotal = totalNum;
    const iva = 0;
    const ica = 0;

    const notasDetalle = [
      cliente_nombre ? `Cliente: ${cliente_nombre}` : '',
      cliente_telefono ? `Tel: ${cliente_telefono}` : '',
      cliente_direccion ? `Dir: ${cliente_direccion} (${ciudad || 'Bogotá / Cundinamarca'})` : '',
      notas ? `Nota: ${notas}` : ''
    ].filter(Boolean).join(' | ');

    // 1. Detectar columnas disponibles en `pedidos` para compatibilidad total
    let hasDireccion = false;
    let hasTelefono = false;
    let hasSubtotal = false;

    try {
      const [cols] = await connection.execute('SHOW COLUMNS FROM pedidos');
      if (Array.isArray(cols)) {
        const colNames = new Set(cols.map(c => (c.Field || '').toLowerCase()));
        hasDireccion = colNames.has('direccion_envio');
        hasTelefono = colNames.has('telefono');
        hasSubtotal = colNames.has('subtotal');
      }
    } catch (colErr) {
      // Ignorar si el motor es fallback
    }

    let insertQuery;
    let insertParams;

    if (hasDireccion && hasTelefono) {
      insertQuery = `INSERT INTO pedidos (usuario_id, subtotal, iva, ica, total, estado, metodo_pago, direccion_envio, telefono, notas, creado_en)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
      insertParams = [
        usuario_id,
        subtotal,
        iva,
        ica,
        totalNum,
        'Pendiente',
        metodo_pago || 'WhatsApp / Contraentrega',
        `${cliente_direccion || 'No especificada'} (${ciudad || 'Bogotá / Cundinamarca'})`,
        cliente_telefono || '',
        notasDetalle || notas || 'Pedido Online'
      ];
    } else if (hasSubtotal) {
      insertQuery = `INSERT INTO pedidos (usuario_id, tipo_persona, subtotal, iva, ica, total, estado, metodo_pago, notas, creado_en)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
      insertParams = [
        usuario_id,
        'Natural',
        subtotal,
        iva,
        ica,
        totalNum,
        'Pendiente',
        metodo_pago || 'WhatsApp / Contraentrega',
        notasDetalle || 'Pedido Online'
      ];
    } else {
      insertQuery = `INSERT INTO pedidos (usuario_id, total, estado, metodo_pago, notas, creado_en)
                     VALUES (?, ?, ?, ?, ?, NOW())`;
      insertParams = [
        usuario_id,
        totalNum,
        'Pendiente',
        metodo_pago || 'WhatsApp / Contraentrega',
        notasDetalle || 'Pedido Online'
      ];
    }

    const [pedidoResult] = await connection.execute(insertQuery, insertParams);

    const pedidoId = pedidoResult.insertId;

    // 2. Insertar detalles y actualizar stock
    for (const item of productos) {
      const cantidad = Number(item.cantidad) || 1;
      const precioUnit = Number(item.precio) || 0;
      const subtotal = cantidad * precioUnit;

      await connection.execute(
        `INSERT INTO detalle_pedido (pedido_id, producto_id, nombre_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.id || null, item.nombre, cantidad, precioUnit, subtotal]
      );

      // Descontar inventario si el producto existe
      if (item.id) {
        await connection.execute(
          `UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?`,
          [cantidad, item.id]
        );

        await connection.execute(
          `INSERT INTO movimientos_inventario (producto_id, nombre_producto, tipo, cantidad, nota)
           VALUES (?, ?, 'salida', ?, ?)`,
          [item.id, item.nombre, cantidad, `Venta Pedido #${pedidoId}`]
        );
      }
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Pedido registrado con éxito',
      pedidoId,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar pedido:', error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  } finally {
    connection.release();
  }
});

// GET /api/pedidos/mis-pedidos (requiere token)
router.get('/mis-pedidos', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Inicia sesión para ver tus pedidos' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const [pedidos] = await db.execute(
      `SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC`,
      [decoded.id]
    );

    for (const p of pedidos) {
      const [det] = await db.execute('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [p.id]);
      p.detalle = det;
    }

    res.json(pedidos);
  } catch (err) {
    res.status(401).json({ error: 'Sesión no válida' });
  }
});

module.exports = router;
