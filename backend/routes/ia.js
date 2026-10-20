const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const db = require('../database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const iaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: { error: 'Límite de consultas alcanzado. Espera unos minutos.' }
});

// Limpia cualquier símbolo de Markdown o LaTeX residual para que el texto sea 100% limpio
function limpiarSimbolos(texto) {
  if (!texto) return '';
  return texto
    .replace(/```json[\s\S]*$/gi, '')
    .replace(/```[\s\S]*$/g, '')
    .replace(/\$\$/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\times/g, 'x')
    .replace(/\\approx/g, '≈')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

router.post('/consultar', iaLimiter, async (req, res) => {
  const { mensaje, historial = [] } = req.body;

  if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
    return res.status(400).json({ error: 'La consulta no puede estar vacía' });
  }

  // Motor determinista de respaldo por si aún no se ha configurado GEMINI_API_KEY en Render
  async function cotizarLocalmente(textoUsuario) {
    const [prods] = await db.execute('SELECT id, nombre, precio, stock, medidas, categoria FROM productos WHERE stock > 0');
    const msg = textoUsuario.toLowerCase();
    const numMatch = msg.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|metros|m²|metro|unidades|m3)?/);
    const area = numMatch ? Math.max(1, parseFloat(numMatch[1].replace(',', '.'))) : 10;

    // Buscar producto mencionado
    let prod = prods.find(p => msg.includes(p.nombre.toLowerCase())) ||
      (msg.includes('bloque') && msg.includes('5') ? prods.find(p => p.id === 6) :
      msg.includes('bloque') && msg.includes('perf') ? prods.find(p => p.id === 12) :
      msg.includes('bloquel') ? prods.find(p => p.id === 10) :
      msg.includes('bloque') ? prods.find(p => p.id === 5) :
      msg.includes('refractario') ? prods.find(p => p.id === 13) :
      msg.includes('santafe') || msg.includes('liviano') ? prods.find(p => p.id === 11) :
      msg.includes('macizo') ? prods.find(p => p.id === 15) :
      msg.includes('tolete') ? prods.find(p => p.id === 14) :
      msg.includes('prisma') ? prods.find(p => p.id === 19) :
      msg.includes('cocoa') ? prods.find(p => p.id === 20) :
      msg.includes('grande') && msg.includes('rosado') ? prods.find(p => p.id === 4) :
      msg.includes('grande') ? prods.find(p => p.id === 3) :
      msg.includes('peque') && msg.includes('rosado') ? prods.find(p => p.id === 2) :
      msg.includes('teja') ? prods.find(p => p.id === 9) :
      msg.includes('corbat') ? prods.find(p => p.id === 17) :
      msg.includes('adoqu') ? prods.find(p => p.id === 8) :
      msg.includes('tableta') && msg.includes('25') ? prods.find(p => p.id === 18) :
      msg.includes('tableta') ? prods.find(p => p.id === 16) :
      msg.includes('arena') && msg.includes('amarilla') ? prods.find(p => p.id === 22) :
      msg.includes('arena') ? prods.find(p => p.id === 21) :
      msg.includes('mixto') ? prods.find(p => p.id === 23) :
      prods[0]);

    let rendimiento = 56;
    if (prod.id === 3 || prod.id === 4) rendimiento = 38;
    else if (prod.id === 5 || prod.id === 6 || prod.id === 12) rendimiento = 13;
    else if (prod.id === 10) rendimiento = 5;
    else if (prod.id === 15) rendimiento = 60;
    else if (prod.id === 13) rendimiento = 36;
    else if (prod.id === 16) rendimiento = 25;
    else if (prod.id === 18) rendimiento = 16;
    else if (prod.id === 8 || prod.id === 17) rendimiento = 45;
    else if (prod.id === 9) rendimiento = 15;
    else if (prod.id >= 21) rendimiento = 0.02;

    const cantidad = prod.id >= 21 ? Math.max(1, Math.ceil(area * rendimiento)) : Math.ceil(area * rendimiento);
    const precioUnit = Number(prod.precio);
    const subtotal = cantidad * precioUnit;

    const respuesta = `Material: ${prod.nombre} (${prod.medidas}).\nCantidad requerida para ${area} m2: ${cantidad.toLocaleString('es-CO')} unidades (incluye 7% desperdicio).\nPrecio unitario: ${precioUnit.toLocaleString('es-CO')} COP.\nCosto total estimado: ${subtotal.toLocaleString('es-CO')} COP. Despacho desde Vereda Patio Bonito, Nemocón.`;

    return {
      respuesta,
      calculo: {
        area_m2: area,
        material_principal: prod.nombre,
        unidades_estimadas: cantidad,
        costo_total_cop: subtotal,
        items: [{ id: prod.id, nombre: prod.nombre, cantidad, precio_unitario: precioUnit, subtotal }]
      },
      timestamp: new Date().toISOString()
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const localRes = await cotizarLocalmente(mensaje);
    return res.json(localRes);
  }

  try {
    // 1. Obtener catálogo compacto para ahorrar tokens
    let catalogoStr = '';
    try {
      const [prods] = await db.execute('SELECT id, nombre, precio, stock, medidas FROM productos WHERE stock > 0');
      catalogoStr = prods.map(p => 
        `ID ${p.id}: ${p.nombre} (${p.medidas}) = $${Number(p.precio)} COP [Stock:${p.stock}]`
      ).join('\n');
    } catch (e) {
      console.warn('Catálogo IA fallback desde JSON local:', e.message);
      try {
        const fs = require('fs');
        const fallbackFile = path.join(__dirname, '../data/productosFallback.json');
        if (fs.existsSync(fallbackFile)) {
          const prods = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
          catalogoStr = prods.map(p => 
            `ID ${p.id}: ${p.nombre} (${p.medidas}) = $${Number(p.precio)} COP [Stock:${p.stock}]`
          ).join('\n');
        }
      } catch (fErr) {
        console.warn('Error leyendo fallback JSON para IA:', fErr.message);
      }
    }

    // 2. Prompt ultra-directo, sin relleno y sin símbolos raros
    const SYSTEM_PROMPT = `Eres Ing. FES, cotizador de F.E.S. Construcción (Vereda Patio Bonito, Nemocón).
CATÁLOGO (COP):
${catalogoStr}

RENDIMIENTOS POR m² (incluye 7% desperdicio):
- Ladrillo pequeño (18*9*6): 56 u/m²
- Ladrillo grande (22*12*7): 38 u/m²
- Prensado Santafé / Tolete #1 / Prisma / Cocoa (24x12x6): 56 u/m²
- Prensado Macizo (24.5x12x5.5): 60 u/m²
- Bloque #4, #5 o Perf. Vert (33x23x11.5): 13 u/m²
- Bloquelón: 5 u/m²
- Tableta 20x20: 25 u/m² | Tableta 25x25: 16 u/m²
- Adoquín: 45 u/m² | Teja: 15 u/m² | Refractario: 36 u/m²
- Arena / Mixto (m³): para pañete o pega 0.02 m³ por m² (redondear a m³ entero, mínimo 1 m³).

REGLAS ESTRICTAS DE RESPUESTA (PARA NO GASTAR TOKENS):
1. Ve directo al grano en MÁXIMO 4 líneas cortas. CERO relleno, CERO introducciones largas, CERO recomendaciones extensas.
2. PROHIBIDO usar símbolos Markdown o LaTeX: NO uses asteriscos (**), NO uses numerales (###), NO uses signos de fórmula ($ o \\text o \\times), NO uses tablas (|). Escribe en texto plano, limpio y directo.
3. Indica únicamente:
   - Material y medida
   - Cantidad total requerida (con desperdicio incluido)
   - Precio unitario y Costo Total en pesos colombianos (COP)
4. Al final, si cotizaste algún producto, agrega SIEMPRE este bloque JSON exacto:
\`\`\`json
{"calculo":{"area_m2":100,"material_principal":"Nombre","unidades_estimadas":100,"costo_total_cop":100000,"items":[{"id":1,"nombre":"Nombre","cantidad":100,"precio_unitario":1000,"subtotal":100000}]}}
\`\`\``;

    const contents = [];
    const historialLimpio = historial.slice(-4);
    for (const h of historialLimpio) {
      contents.push({
        role: h.role === 'bot' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content || h.texto || '' }]
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: mensaje.trim() }]
    });

    const bodyData = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 700,
        topP: 0.9,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    const fetchFn = globalThis.fetch || require('node-fetch');

    let response;
    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify(bodyData)
      });
      if (response.ok || response.status !== 503) {
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!response.ok) {
      console.warn('Gemini API status:', response.status, '- usando motor de ingeniería integrado');
      const localRes = await cotizarLocalmente(mensaje);
      return res.json(localRes);
    }

    const data = await response.json();
    const textoCompleto = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar la consulta.';

    let calculoExtraido = null;
    let textoSinJson = textoCompleto;

    const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
    const match = textoCompleto.match(jsonRegex);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        calculoExtraido = parsed.calculo || parsed;
        textoSinJson = textoCompleto.replace(match[0], '').trim();
      } catch (pe) {
        console.warn('Advertencia parseando JSON de IA:', pe.message);
      }
    }

    const textoLimpio = limpiarSimbolos(textoSinJson);

    res.json({
      respuesta: textoLimpio,
      calculo: calculoExtraido
    });

  } catch (error) {
    console.warn('Fallback en ruta /api/ia/consultar:', error.message);
    const localRes = await cotizarLocalmente(mensaje);
    return res.json(localRes);
  }
});

module.exports = router;
