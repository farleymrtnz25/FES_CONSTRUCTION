const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Rate limit específico para el chatbot: 30 mensajes por usuario cada 10 minutos
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: 'Has enviado demasiados mensajes. Por favor espera unos minutos.' }
});

// Contexto del sistema: quién es el bot y de qué habla
const SYSTEM_CONTEXT = `Eres "FES Asistente", el asistente virtual inteligente de F.E.S. Construcción, 
una empresa colombiana especializada en materiales de construcción de alta calidad.

Tu rol:
- Ayudar a los clientes con preguntas sobre productos de construcción (cemento, varillas, bloques, herramientas, etc.)
- Explicar conceptos de construcción de forma sencilla
- Orientar sobre precios, disponibilidad y características de materiales
- Ayudar con el proceso de compra en la tienda virtual
- Responder preguntas sobre envíos, pedidos y pagos

Información de la empresa:
- Nombre: F.E.S. Construcción
- Tipo: Tienda virtual de materiales de construcción
- Contacto: disponible en la sección de contacto del sitio
- Productos: materiales de construcción, herramientas, acabados

Reglas de comportamiento:
- Responde SIEMPRE en español
- Sé amable, profesional y conciso (máximo 3-4 oraciones por respuesta)
- Si no sabes algo específico, sugiere contactar directamente a la empresa
- No inventes precios exactos ni datos que no tengas
- Usa emojis con moderación para hacer la conversación más amigable 🏗️`;

/**
 * POST /api/chatbot
 * Body: { mensaje: string, historial: [{role, content}] }
 */
router.post('/', chatLimiter, async (req, res) => {
  const { mensaje, historial = [] } = req.body;

  if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  if (mensaje.trim().length > 1000) {
    return res.status(400).json({ error: 'El mensaje es demasiado largo (máximo 1000 caracteres).' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
    // Modo demo si no hay API key configurada
    return res.json({
      respuesta: `¡Hola! 👋 Soy FES Asistente. Estoy en modo de prueba porque el administrador aún no ha configurado la API de IA. 

Para activarme completamente, agrega tu clave de Google Gemini en el archivo **backend/.env** como: GEMINI_API_KEY=tu_clave_aqui

Puedes obtener una clave gratis en: https://aistudio.google.com/app/apikey`,
      modo: 'demo'
    });
  }

  try {
    // Construir el historial de conversación para Gemini
    const contents = [];

    // Agregar historial previo (máximo últimos 10 mensajes para no exceder tokens)
    const historialReciente = historial.slice(-10);
    for (const msg of historialReciente) {
      contents.push({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Agregar el mensaje actual del usuario
    contents.push({
      role: 'user',
      parts: [{ text: mensaje.trim() }]
    });

    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_CONTEXT }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
        topP: 0.9
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Usar fetch nativo de Node 18+ o node-fetch si está disponible
    const fetchFn = globalThis.fetch || require('node-fetch');

    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error de Gemini API:', response.status, errText);

      if (response.status === 403 || response.status === 401) {
        return res.status(500).json({ error: 'API Key inválida. Verifica tu clave de Gemini en el archivo .env' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Demasiadas solicitudes a la IA. Intenta en unos segundos.' });
      }

      return res.status(500).json({ error: 'Hubo un problema conectando con la IA. Intenta de nuevo.' });
    }

    const data = await response.json();
    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoRespuesta) {
      return res.json({ respuesta: 'No pude generar una respuesta. ¿Puedes reformular tu pregunta?' });
    }

    res.json({ respuesta: textoRespuesta });

  } catch (err) {
    console.error('Error en chatbot route:', err.message);
    res.status(500).json({ error: 'Error interno del servidor. Intenta de nuevo.' });
  }
});

module.exports = router;
