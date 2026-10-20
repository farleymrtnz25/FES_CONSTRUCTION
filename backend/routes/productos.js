const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/productos (Público con filtros avanzados)
router.get('/', async (req, res) => {
  try {
    const { categoria, buscar, min_precio, max_precio, disponible, orden } = req.query;
    let query = 'SELECT * FROM productos WHERE 1=1';
    const params = [];

    if (categoria && categoria !== 'Todos') {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    if (buscar) {
      query += ' AND (nombre LIKE ? OR descripcion LIKE ? OR medidas LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
    }
    if (min_precio) {
      query += ' AND precio >= ?';
      params.push(parseFloat(min_precio));
    }
    if (max_precio) {
      query += ' AND precio <= ?';
      params.push(parseFloat(max_precio));
    }
    if (disponible === 'true') {
      query += ' AND stock > 0';
    }

    if (orden === 'precio_asc') {
      query += ' ORDER BY precio ASC';
    } else if (orden === 'precio_desc') {
      query += ' ORDER BY precio DESC';
    } else if (orden === 'nombre') {
      query += ' ORDER BY nombre ASC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.warn('⚠️ Base de datos no disponible, utilizando catálogo offline de contingencia:', error.message);
    try {
      const fs = require('fs');
      const path = require('path');
      const fallbackFile = path.join(__dirname, '../data/productosFallback.json');
      if (fs.existsSync(fallbackFile)) {
        const fallbackData = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
        return res.json(fallbackData);
      }
    } catch (e) {
      console.error('Error al cargar fallback:', e.message);
    }
    res.status(500).json({ error: 'Error en la base de datos de productos' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto individual:', error);
    res.status(500).json({ error: 'Error al consultar producto' });
  }
});

module.exports = router;
