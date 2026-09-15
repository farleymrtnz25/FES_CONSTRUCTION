const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiter para rutas de auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Demasiados intentos. Intenta en 15 minutos.' }
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pedidos', require('./routes/pedidos'));

// Ruta: Obtener productos (pública)
app.get('/api/productos', async (req, res) => {
  try {
    const { categoria, buscar, min_precio, max_precio, disponible } = req.query;
    let query = 'SELECT * FROM productos WHERE 1=1';
    const params = [];

    if (categoria && categoria !== 'Todos') {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    if (buscar) {
      query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`);
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

    query += ' ORDER BY id ASC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta: Guardar pedido WhatsApp (sin auth, legado)
app.post('/api/carrito', async (req, res) => {
  try {
    const { productos } = req.body;
    console.log('Nuevo pedido WhatsApp recibido:', productos);
    res.json({ success: true, message: 'Pedido registrado' });
  } catch (error) {
    console.error('Error al guardar pedido:', error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
});

const path = require('path');
const fs = require('fs');

// Servir frontend si existe la carpeta dist (despliegue unificado)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Health check (cuando el backend se despliega por separado)
  app.get('/', (req, res) => {
    res.json({ message: 'API de F.E.S. Construcción funcionando ✅', version: '2.0' });
  });
}

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});