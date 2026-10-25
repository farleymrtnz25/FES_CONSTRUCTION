const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Todas las rutas de administración requieren autenticación y rol 'admin'
router.use(authMiddleware, adminMiddleware);

// --- PRODUCTOS ---

// GET /api/admin/productos
router.get('/productos', async (req, res) => {
  try {
    const [productos] = await db.execute('SELECT * FROM productos ORDER BY id ASC');
    res.json(productos);
  } catch (error) {
    console.error('Admin Products DB Error:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/admin/productos (Crear producto)
router.post('/productos', async (req, res) => {
  try {
    const { nombre, precio, medidas, descripcion, stock, imagen, categoria } = req.body;
    if (!nombre || precio === undefined) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }

    const [result] = await db.execute(
      'INSERT INTO productos (nombre, precio, medidas, descripcion, stock, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, Number(precio), medidas || 'Estándar', descripcion || '', Number(stock) || 0, imagen || '', categoria || 'General']
    );

    res.status(201).json({ message: 'Producto creado', id: result.insertId });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al registrar producto' });
  }
});

// PUT /api/admin/productos/:id (Actualizar producto completo)
router.put('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, medidas, descripcion, stock, imagen, categoria } = req.body;

    await db.execute(
      'UPDATE productos SET nombre = ?, precio = ?, medidas = ?, descripcion = ?, stock = ?, imagen = ?, categoria = ? WHERE id = ?',
      [nombre, Number(precio), medidas, descripcion, Number(stock), imagen, categoria, id]
    );

    res.json({ message: 'Producto actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/admin/productos/:id
router.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// POST /api/admin/productos/:id/stock-adjust
router.post('/productos/:id/stock-adjust', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, cantidad, nota } = req.body;

    if (!['entrada', 'salida'].includes(tipo) || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ error: 'Tipo o cantidad inválidos' });
    }

    const [prod] = await db.execute('SELECT nombre, stock FROM productos WHERE id = ?', [id]);
    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const cantNum = Number(cantidad);
    const nuevoStock = tipo === 'entrada' ? prod[0].stock + cantNum : Math.max(0, prod[0].stock - cantNum);

    await db.execute('UPDATE productos SET stock = ? WHERE id = ?', [nuevoStock, id]);
    await db.execute(
      'INSERT INTO movimientos_inventario (producto_id, nombre_producto, tipo, cantidad, nota) VALUES (?, ?, ?, ?, ?)',
      [id, prod[0].nombre, tipo, cantNum, nota || 'Ajuste manual administrativo']
    );

    return res.json({ message: 'Stock actualizado', nuevoStock });
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({ error: 'Error en base de datos al ajustar stock' });
  }
});

// PATCH /api/admin/productos/:id/stock — actualización directa
router.patch('/productos/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined || Number(stock) < 0) return res.status(400).json({ error: 'Stock inválido' });

    const [prod] = await db.execute('SELECT nombre, stock FROM productos WHERE id = ?', [id]);
    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const diff = Number(stock) - prod[0].stock;
    if (diff !== 0) {
      await db.execute('UPDATE productos SET stock = ? WHERE id = ?', [Number(stock), id]);
      await db.execute(
        'INSERT INTO movimientos_inventario (producto_id, nombre_producto, tipo, cantidad, nota) VALUES (?, ?, ?, ?, ?)',
        [id, prod[0].nombre, diff > 0 ? 'entrada' : 'salida', Math.abs(diff), 'Ajuste de stock directo']
      );
    }
    res.json({ message: 'Stock actualizado', nuevoStock: Number(stock) });
  } catch (error) {
    console.error('Error al actualizar stock directo:', error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
});

// PATCH /api/admin/productos/:id/precio — actualización directa de precio
router.patch('/productos/:id/precio', async (req, res) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;
    if (precio === undefined || isNaN(precio) || Number(precio) < 0) {
      return res.status(400).json({ error: 'Precio inválido' });
    }

    const [prod] = await db.execute('SELECT nombre FROM productos WHERE id = ?', [id]);
    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    await db.execute('UPDATE productos SET precio = ? WHERE id = ?', [Number(precio), id]);
    res.json({ message: 'Precio actualizado con éxito', nuevoPrecio: Number(precio) });
  } catch (error) {
    console.error('Error al actualizar precio:', error);
    res.status(500).json({ error: 'Error al actualizar precio' });
  }
});

// --- PEDIDOS ---

// GET /api/admin/pedidos
router.get('/pedidos', async (req, res) => {
  try {
    const [pedidos] = await db.execute(`
      SELECT p.*, u.nombre AS user_nombre, u.email AS cliente_email
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.creado_en DESC
    `);
    for (const p of pedidos) {
      const [det] = await db.execute('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [p.id]);
      p.detalle = det;

      // Extraer datos legibles de contacto si vienen dentro del campo notas
      if (!p.cliente_nombre) {
        if (p.user_nombre) {
          p.cliente_nombre = p.user_nombre;
        } else if (p.notas && p.notas.includes('Cliente: ')) {
          const match = p.notas.match(/Cliente:\s*([^|]+)/);
          if (match) p.cliente_nombre = match[1].trim();
        }
      }
      if (!p.telefono && p.notas && p.notas.includes('Tel: ')) {
        const match = p.notas.match(/Tel:\s*([^|]+)/);
        if (match) p.telefono = match[1].trim();
      }
      if (!p.direccion_envio && p.notas && p.notas.includes('Dir: ')) {
        const match = p.notas.match(/Dir:\s*([^|]+)/);
        if (match) p.direccion_envio = match[1].trim();
      }
    }
    res.json(pedidos);
  } catch (error) {
    console.error('Admin Orders DB Error:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// PUT /api/admin/pedidos/:id/status
router.put('/pedidos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ message: 'Estado del pedido actualizado exitosamente', estado });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
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

    const [totalGeneral] = await db.execute(
      `SELECT COUNT(*) AS total_pedidos, COALESCE(SUM(total), 0) AS ingresos_totales FROM pedidos ${dateCondition}`,
      params
    );

    const [porDia] = await db.execute(
      `SELECT DATE(creado_en) AS fecha, SUM(total) AS ingresos, COUNT(*) AS pedidos FROM pedidos ${dateCondition} GROUP BY fecha ORDER BY fecha DESC LIMIT 30`,
      params
    );

    const [porMes] = await db.execute(
      `SELECT DATE_FORMAT(creado_en, '%Y-%m') AS mes, SUM(total) AS ingresos, COUNT(*) AS pedidos FROM pedidos ${dateCondition} GROUP BY mes ORDER BY mes DESC LIMIT 12`,
      params
    );

    const [porAno] = await db.execute(
      `SELECT YEAR(creado_en) AS ano, SUM(total) AS ingresos, COUNT(*) AS pedidos FROM pedidos ${dateCondition} GROUP BY ano ORDER BY ano DESC`,
      params
    );

    // Top productos
    let topQuery = `
      SELECT dp.nombre_producto, SUM(dp.cantidad) AS unidades_vendidas, SUM(dp.subtotal) AS ingresos_producto
      FROM detalle_pedido dp
      JOIN pedidos p ON dp.pedido_id = p.id
      ${dateCondition}
      GROUP BY dp.nombre_producto 
      ORDER BY unidades_vendidas DESC
      LIMIT 6
    `;
    const [topProductos] = await db.execute(topQuery, params);

    // Listado individual
    const [individual] = await db.execute(`
      SELECT p.id, p.creado_en, p.total, p.estado, p.metodo_pago, COALESCE(u.nombre, 'Cliente Directo') AS cliente_nombre
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ${dateCondition}
      ORDER BY p.creado_en DESC
      LIMIT 50
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
    res.status(500).json({ error: 'Error al calcular reportes' });
  }
});

// GET /api/admin/reportes/inventario
router.get('/reportes/inventario', async (req, res) => {
  try {
    const [movimientos] = await db.execute(`SELECT * FROM movimientos_inventario ORDER BY fecha DESC LIMIT 100`);
    const [stockActual] = await db.execute(`SELECT id, nombre, stock, precio, categoria FROM productos ORDER BY stock ASC`);
    res.json({ movimientos, stockActual });
  } catch (error) {
    console.error('Admin Inv DB Error:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

module.exports = router;
