const express = require('express');
const router = express.Router();
const db = require('../database');

// Inicializar tabla de reseñas en MySQL si está disponible
(async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS resenas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        cargo VARCHAR(150) DEFAULT 'Cliente Verificado',
        estrellas INT NOT NULL DEFAULT 5,
        comentario TEXT NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    // Fallback manejado por database.js
  }
})();

// GET /api/resenas — Obtener todas las reseñas reales
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM resenas ORDER BY id DESC');
    res.json(rows || []);
  } catch (error) {
    console.error('Error al obtener reseñas:', error.message);
    res.json([]);
  }
});

// POST /api/resenas — Crear una nueva reseña
router.post('/', async (req, res) => {
  try {
    const { nombre, cargo, estrellas, comentario, website_hp } = req.body;

    // Protección Anti-Spam Honeypot
    if (website_hp) {
      return res.status(200).json({ success: true });
    }

    if (!nombre || !comentario || ! nombre.trim() || !comentario.trim()) {
      return res.status(400).json({ error: 'Tu nombre y comentario son obligatorios' });
    }

    const numStars = Math.min(5, Math.max(1, Number(estrellas) || 5));
    const cleanNombre = nombre.trim().slice(0, 120);
    const cleanCargo = (cargo && cargo.trim()) ? cargo.trim().slice(0, 150) : 'Cliente F.E.S. Construcción';
    const cleanComentario = comentario.trim().slice(0, 1000);

    const [result] = await db.execute(
      'INSERT INTO resenas (nombre, cargo, estrellas, comentario) VALUES (?, ?, ?, ?)',
      [cleanNombre, cleanCargo, numStars, cleanComentario]
    );

    const nuevaResena = {
      id: result.insertId || Date.now(),
      nombre: cleanNombre,
      cargo: cleanCargo,
      estrellas: numStars,
      comentario: cleanComentario,
      creado_en: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: '¡Gracias! Tu reseña ha sido publicada exitosamente.',
      resena: nuevaResena
    });
  } catch (error) {
    console.error('Error al guardar reseña:', error.message);
    res.status(500).json({ error: 'No se pudo publicar la reseña' });
  }
});

// DELETE /api/resenas/:id — Eliminar reseña
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM resenas WHERE id = ?', [id]);
    res.json({ success: true, message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
});

module.exports = router;
