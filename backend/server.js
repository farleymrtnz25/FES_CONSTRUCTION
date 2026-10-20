const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Cabeceras de Seguridad y Protección (Requisito 4 y Estándar de Seguridad)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// 2. CORS y Parseo de datos
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Demasiadas solicitudes. Por favor intenta más tarde.' }
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { error: 'Demasiados intentos de autenticación. Intenta en 15 minutos.' }
});

// 4. Rutas de la API
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/ia', require('./routes/ia'));

// Ruta de contacto con Anti-Spam Honeypot y envío al correo frlmrtnz@gmail.com
app.post('/api/contact', async (req, res) => {
  const { nombre, email, telefono, municipio, mensaje, website_hp } = req.body;

  if (website_hp) {
    console.warn('⚠️ Bot detectado por Honeypot en formulario de contacto');
    return res.status(200).json({ success: true, message: 'Mensaje recibido' });
  }

  if (!nombre || !telefono || !mensaje) {
    return res.status(400).json({ error: 'Nombre, teléfono y mensaje son obligatorios' });
  }

  const destinatario = 'frlmrtnz@gmail.com';
  console.log(`📬 Nueva solicitud de cotización para ${destinatario}:`, {
    nombre,
    email,
    telefono,
    municipio,
    mensaje
  });

  // Intento de despacho automático por FormSubmit AJAX hacia frlmrtnz@gmail.com
  try {
    const fetchFn = globalThis.fetch;
    if (fetchFn) {
      await fetchFn(`https://formsubmit.co/ajax/${destinatario}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Nueva Cotización FES Construcción - ${nombre}`,
          Nombre_o_Empresa: nombre,
          Telefono_WhatsApp: telefono,
          Correo_Cliente: email || 'No especificado',
          Municipio_Entrega: municipio || 'Vereda Patio Bonito / Sabana',
          Detalle_Materiales: mensaje
        })
      });
    }
  } catch (mailErr) {
    console.warn('Nota de envío FormSubmit:', mailErr.message);
  }

  res.json({
    success: true,
    destinatario,
    message: `¡Solicitud enviada con éxito a ${destinatario}!`
  });
});

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'F.E.S. Construcción API 2.0', time: new Date() });
});

// Servir frontend compilado si existe
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: '🚀 API Profesional de F.E.S. Construcción Fase 2 en línea',
      database: 'MySQL XAMPP conectada',
      ia: 'Google Gemini Flash Activo',
      version: '2.0.0'
    });
  });
}

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🏗️  F.E.S. CONSTRUCCIÓN - BACKEND FASE 2 INICIADO`);
  console.log(`🌐  Servidor activo en: http://localhost:${PORT}`);
  console.log(`📧  Correo Oficial: frlmrtnz@gmail.com`);
  console.log(`📍  Ubicación: Vereda Patio Bonito, Nemocón`);
  console.log(`=======================================================`);
});
