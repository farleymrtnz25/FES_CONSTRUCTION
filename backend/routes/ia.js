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

  // Función auxiliar para detectar el producto en el mensaje
  function detectarProducto(msg, prods) {
    const exacto = prods.find(p => msg.includes(p.nombre.toLowerCase()));
    if (exacto) return exacto;
    if (msg.includes('bloque') && msg.includes('5')) return prods.find(p => p.id === 6);
    if (msg.includes('bloque') && (msg.includes('perf') || msg.includes('estructural') || msg.includes('dp'))) return prods.find(p => p.id === 12);
    if (msg.includes('bloquel')) return prods.find(p => p.id === 10);
    if (msg.includes('bloque')) return prods.find(p => p.id === 5);
    if (msg.includes('refractario') || msg.includes('horno') || msg.includes('chimenea')) return prods.find(p => p.id === 13);
    if (msg.includes('santafe') || msg.includes('santafé') || msg.includes('liviano')) return prods.find(p => p.id === 11);
    if (msg.includes('macizo')) return prods.find(p => p.id === 15);
    if (msg.includes('tolete')) return prods.find(p => p.id === 14);
    if (msg.includes('prisma')) return prods.find(p => p.id === 19);
    if (msg.includes('cocoa')) return prods.find(p => p.id === 20);
    if (msg.includes('grande') && msg.includes('rosado')) return prods.find(p => p.id === 4);
    if (msg.includes('grande')) return prods.find(p => p.id === 3);
    if (msg.includes('peque') && msg.includes('negro')) return prods.find(p => p.id === 1);
    if (msg.includes('peque') && msg.includes('rosado')) return prods.find(p => p.id === 2);
    if (msg.includes('teja') || msg.includes('cubierta') || msg.includes('techo')) return prods.find(p => p.id === 9);
    if (msg.includes('corbat')) return prods.find(p => p.id === 17);
    if (msg.includes('adoqu') || msg.includes('parqueadero') || msg.includes('peatonal')) return prods.find(p => p.id === 8);
    if (msg.includes('tableta') && msg.includes('25')) return prods.find(p => p.id === 18);
    if (msg.includes('tableta') || msg.includes('piso')) return prods.find(p => p.id === 16);
    if (msg.includes('arena') && msg.includes('amarilla')) return prods.find(p => p.id === 22);
    if (msg.includes('arena')) return prods.find(p => p.id === 21);
    if (msg.includes('mixto')) return prods.find(p => p.id === 23);
    return null;
  }

  function obtenerRendimiento(prodId) {
    if (prodId === 3 || prodId === 4) return 38;
    if (prodId === 5 || prodId === 6 || prodId === 12) return 13;
    if (prodId === 10) return 5;
    if (prodId === 15) return 60;
    if (prodId === 13) return 36;
    if (prodId === 16) return 25;
    if (prodId === 18) return 16;
    if (prodId === 8 || prodId === 17) return 45;
    if (prodId === 9) return 15;
    if (prodId >= 21) return 0.02;
    return 56; // Ladrillo pequeño 18*9*6, Prensado Santafé, Tolete, Prisma, Cocoa
  }

  // Extrae montos de dinero en COP (ej: "1 millon", "2.5 millones", "500 mil", "$1.000.000", "1000000")
  function extraerPresupuestoCOP(msg) {
    if (/un\s+mill[oó]n/i.test(msg)) return 1000000;
    const matchMillones = msg.match(/(\d+(?:[.,]\d+)?)\s*mill[oó]n(?:es)?/i);
    if (matchMillones) {
      return Math.round(parseFloat(matchMillones[1].replace(',', '.')) * 1000000);
    }
    // Números con puntos de miles como 1.000.000 o 500.000
    const matchPuntos = msg.match(/\$?\s*(\d{1,3}(?:\.\d{3}){2,}|\d{3}\.\d{3})\b/);
    if (matchPuntos) {
      const val = parseInt(matchPuntos[1].replace(/\./g, ''), 10);
      if (val >= 50000) return val;
    }
    const matchMilPesos = msg.match(/(\d+(?:[.,]\d+)?)\s*mil\s*(?:pesos|cop|\$)/i);
    if (matchMilPesos) {
      return Math.round(parseFloat(matchMilPesos[1].replace(',', '.')) * 1000);
    }
    const matchGrande = msg.match(/\b(\d{5,9})\b/);
    if (matchGrande) {
      return parseInt(matchGrande[1], 10);
    }
    return null;
  }

  // Motor determinista de ingeniería con 4 modos: Área (m²), Unidades -> m², Presupuesto ($ COP) -> m², y Recomendación Técnica
  async function cotizarLocalmente(textoUsuario) {
    let prods = [];
    try {
      const [rows] = await db.execute('SELECT id, nombre, precio, stock, medidas, categoria FROM productos WHERE stock > 0');
      prods = rows;
    } catch {
      const fs = require('fs');
      const fallbackFile = path.join(__dirname, '../data/productosFallback.json');
      if (fs.existsSync(fallbackFile)) {
        prods = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
      }
    }

    const msg = textoUsuario.toLowerCase();
    const prodDetectado = detectarProducto(msg, prods);
    const prod = prodDetectado || prods.find(p => p.id === 2) || prods[0];
    const rendimiento = obtenerRendimiento(prod.id);
    const precioUnit = Number(prod.precio);

    // 1. MODO PRESUPUESTO EN DINERO ("Tengo 1 millón, ¿cuánto puedo construir?")
    const esConsultaPresupuesto =
      /mill[oó]n|pesos|presupuesto|cop|\$\s*\d|plata|dinero|alcanza\s+con/i.test(msg) ||
      (extraerPresupuestoCOP(msg) !== null && !/ladrillo|bloque|unidad|m2|m²|metro/i.test(msg.replace(/cu[aá]nto[s]?\s+(?:ladrillos|bloques|metros|m2|m²|puedo)/i, '')));

    const presupuestoCOP = extraerPresupuestoCOP(msg);
    if (esConsultaPresupuesto && presupuestoCOP && presupuestoCOP >= 20000) {
      const unidades = Math.max(1, Math.floor(presupuestoCOP / precioUnit));
      const areaAlcanzada = prod.id >= 21
        ? +(unidades / 0.02).toFixed(1)
        : +(unidades / rendimiento).toFixed(1);
      const largoMuro = +(areaAlcanzada / 2.4).toFixed(1);
      const subtotal = unidades * precioUnit;

      // Comparativa con otros materiales clave para orientar al cliente
      const bloque4 = prods.find(p => p.id === 5);
      const ladrilloPeq = prods.find(p => p.id === 2);
      const prensado = prods.find(p => p.id === 11);

      let comparativa = '';
      if (!prodDetectado && bloque4 && ladrilloPeq) {
        const uLadrillo = Math.floor(presupuestoCOP / Number(ladrilloPeq.precio));
        const m2Ladrillo = +(uLadrillo / 56).toFixed(1);
        const uBloque = Math.floor(presupuestoCOP / Number(bloque4.precio));
        const m2Bloque = +(uBloque / 13).toFixed(1);
        const uPrensado = prensado ? Math.floor(presupuestoCOP / Number(prensado.precio)) : 0;
        const m2Prensado = prensado ? +(uPrensado / 56).toFixed(1) : 0;
        comparativa = `\nComparativa de rendimiento para tu presupuesto de $${presupuestoCOP.toLocaleString('es-CO')} COP:\n- Con ${ladrilloPeq.nombre}: compras ${uLadrillo.toLocaleString('es-CO')} uds y construyes ${m2Ladrillo} m² (muro de 2.4m x ${+(m2Ladrillo / 2.4).toFixed(1)}m).\n- Con ${bloque4.nombre} (más rápido y económico por m²): compras ${uBloque.toLocaleString('es-CO')} uds y construyes ${m2Bloque} m² (muro de 2.4m x ${+(m2Bloque / 2.4).toFixed(1)}m).\n- Con Ladrillo Prensado Santafé (fachada a la vista): compras ${uPrensado.toLocaleString('es-CO')} uds y construyes ${m2Prensado} m².`;
      }

      const respuesta = `Cálculo por Presupuesto Disponible ($${presupuestoCOP.toLocaleString('es-CO')} COP):\nMaterial cotizado: ${prod.nombre} (${prod.medidas}) a $${precioUnit.toLocaleString('es-CO')} COP c/u.\nCantidad que puedes comprar: ${unidades.toLocaleString('es-CO')} unidades.\nÁrea total que puedes construir: ${areaAlcanzada} m² (incluyendo 7% desperdicio NSR-10, equivalente a un muro de 2.40 m de alto por ${largoMuro} m de largo).${comparativa}`;

      return {
        respuesta,
        calculo: {
          modo: 'presupuesto',
          area_m2: areaAlcanzada,
          presupuesto_cop: presupuestoCOP,
          material_principal: prod.nombre,
          unidades_estimadas: unidades,
          costo_total_cop: subtotal,
          items: [{ id: prod.id, nombre: prod.nombre, cantidad: unidades, precio_unitario: precioUnit, subtotal }]
        },
        timestamp: new Date().toISOString()
      };
    }

    // 2. MODO RECOMENDACIÓN DE MATERIALES (por facilidad, rapidez, economía o tipo de obra)
    const esRecomendacion = /recomiend|recomendaci|f[aá]cil|facilidad|r[aá]pido|rapidez|rendidor|econ[oó]mico|barato|mejor\s+material|qu[eé]\s+material|cu[aá]l\s+ladrillo|cu[aá]l\s+me\s+conviene|ventaja/i.test(msg);
    if (esRecomendacion) {
      const numAreaMatch = msg.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|m²|metros)/i);
      const areaRef = numAreaMatch ? Math.max(1, parseFloat(numAreaMatch[1].replace(',', '.'))) : 50;

      let matRecomendado = prods.find(p => p.id === 5) || prod; // Por defecto Bloque #4 por facilidad y economía
      let motivoTecnico = '';

      if (/fachada|vista|est[eé]tica|bonito|exterior/i.test(msg)) {
        matRecomendado = prods.find(p => p.id === 11) || prod; // Prensado Santafé o Tolete/Prisma
        motivoTecnico = `Para FACHADA A LA VISTA te recomendamos el ${matRecomendado.nombre} (${matRecomendado.medidas}) o el Ladrillo Prisma/Cocoa: tienen cara lisa estructural que NO necesita pañete ni pintura, ahorrando hasta un 40% en mano de obra de acabados.`;
      } else if (/piso|terraza|tr[aá]fico|parqueadero|and[eé]n/i.test(msg)) {
        matRecomendado = /vehicular|pesado|parqueadero/i.test(msg)
          ? (prods.find(p => p.id === 17) || prod)
          : (prods.find(p => p.id === 16) || prod);
        motivoTecnico = `Para PISOS Y TRÁFICO te recomendamos ${matRecomendado.nombre} (${matRecomendado.medidas}): alta resistencia a la abrasión, antideslizante y fácil alineación sobre mortero.`;
      } else if (/horno|chimenea|asador|fuego|calor|temperatura/i.test(msg)) {
        matRecomendado = prods.find(p => p.id === 13) || prod;
        motivoTecnico = `Para ALTA TEMPERATURA es indispensable el ${matRecomendado.nombre} (${matRecomendado.medidas}): soporta hasta 1400°C sin fisurarse.`;
      } else if (/placa|entrepiso|cubierta|techo/i.test(msg)) {
        matRecomendado = prods.find(p => p.id === 10) || prod;
        motivoTecnico = `Para PLACAS Y ENTREPISOS FÁCILES te recomendamos el ${matRecomendado.nombre} (${matRecomendado.medidas}): solo usa 5 unidades por m² sobre perfiles metálicos, sin formaleta compleja.`;
      } else {
        // Facilidad constructiva, rapidez o economía en muros
        matRecomendado = prods.find(p => p.id === 5) || prod; // Bloque #4
        motivoTecnico = `Recomendación del Ing. FES por FACILIDAD, RAPIDEZ Y ECONOMÍA:\n1. Más fácil y rápido de instalar: Bloque número 4 (solo 13 unidades por m², avanza 4.3 veces más rápido que el ladrillo pequeño y gasta 60% menos mezcla de pega) o Bloquelón (5 u/m²).\n2. Más económico por m² de muro: Bloque número 4 (~$13.650 COP/m²) seguido de Ladrillo pequeño rosado 18*9*6 (~$14.560 COP/m² con 56 u/m²).\n3. Si buscas muro estructural resistente sin complicaciones: Ladrillo grande 22*12*7 (38 u/m²) o Bloque Perforación Vertical DP.`;
      }

      const rendRec = obtenerRendimiento(matRecomendado.id);
      const cantRec = Math.ceil(areaRef * rendRec);
      const precioRec = Number(matRecomendado.precio);
      const subtotalRec = cantRec * precioRec;

      const respuesta = `${motivoTecnico}\n\nCotización base de referencia para ${areaRef} m² con ${matRecomendado.nombre} (${matRecomendado.medidas}):\nCantidad: ${cantRec.toLocaleString('es-CO')} unidades ($${precioRec.toLocaleString('es-CO')} COP c/u) = Total $${subtotalRec.toLocaleString('es-CO')} COP.`;

      return {
        respuesta,
        calculo: {
          modo: 'recomendacion',
          area_m2: areaRef,
          material_principal: matRecomendado.nombre,
          unidades_estimadas: cantRec,
          costo_total_cop: subtotalRec,
          items: [{ id: matRecomendado.id, nombre: matRecomendado.nombre, cantidad: cantRec, precio_unitario: precioRec, subtotal: subtotalRec }]
        },
        timestamp: new Date().toISOString()
      };
    }

    // 3. MODO CANTIDAD DE UNIDADES -> CUÁNTOS m² PUEDO CONSTRUIR ("Con 1000 ladrillos cuánto podría construir")
    const msgSinDimensiones = msg.replace(/\d+(?:[.,]\d+)?\s*[x*]\s*\d+(?:[.,]\d+)?(?:\s*[x*]\s*\d+(?:[.,]\d+)?)?/g, '');
    const tieneM2Explicito = /\b\d+(?:[.,]\d+)?\s*(?:m2|m²|metros\s*cuadrados|mts2)\b/i.test(msgSinDimensiones);
    const matchUnidades =
      msgSinDimensiones.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:ladrillos?|bloques?|tabletas?|adoquines?|tejas?|bloquelones?|unidades?|piezas?)/i) ||
      (/cu[aá]nto[s]?\s+(?:metros|m2|m²|podr[ií]a\s+construir|puedo\s+construir|alcanza|rinde|sale)/i.test(msgSinDimensiones) && !tieneM2Explicito
        ? msgSinDimensiones.match(/(\d{1,3}(?:\.\d{3})+|\d+)/)
        : null);

    if (!tieneM2Explicito && (matchUnidades || /\bmil\s+(?:ladrillos?|bloques?|unidades?)/i.test(msgSinDimensiones))) {
      let cantidadUnidades = 1000;
      if (matchUnidades && matchUnidades[1]) {
        const rawNum = matchUnidades[1];
        cantidadUnidades = /\d{1,3}\.\d{3}/.test(rawNum)
          ? parseInt(rawNum.replace(/\./g, ''), 10)
          : Math.max(1, Math.round(parseFloat(rawNum.replace(',', '.'))));
      }
      const areaConstruible = prod.id >= 21
        ? +(cantidadUnidades / 0.02).toFixed(1)
        : +(cantidadUnidades / rendimiento).toFixed(1);
      const areaSinDesperdicio = prod.id >= 21
        ? areaConstruible
        : +(cantidadUnidades / (rendimiento / 1.07)).toFixed(1);
      const largoMuro = +(areaConstruible / 2.4).toFixed(1);
      const subtotal = cantidadUnidades * precioUnit;
      const arenaM3 = Math.max(1, +(areaConstruible * 0.02).toFixed(1));

      const respuesta = `Rendimiento constructivo para ${cantidadUnidades.toLocaleString('es-CO')} unidades de ${prod.nombre} (${prod.medidas}):\nÁrea que puedes construir: ${areaConstruible} m² efectivos (considerando 7% de desperdicio NSR-10; o hasta ${areaSinDesperdicio} m² en mampostería limpia sin cortes).\nDimensión equivalente: Un muro de 2.40 m de altura por ${largoMuro} metros lineales de largo (requiere aprox. ${arenaM3} m³ de arena para mortero de pega).\nValor de las ${cantidadUnidades.toLocaleString('es-CO')} unidades: $${subtotal.toLocaleString('es-CO')} COP ($${precioUnit.toLocaleString('es-CO')} COP c/u).`;

      return {
        respuesta,
        calculo: {
          modo: 'unidades_a_m2',
          area_m2: areaConstruible,
          material_principal: prod.nombre,
          unidades_estimadas: cantidadUnidades,
          costo_total_cop: subtotal,
          items: [{ id: prod.id, nombre: prod.nombre, cantidad: cantidadUnidades, precio_unitario: precioUnit, subtotal }]
        },
        timestamp: new Date().toISOString()
      };
    }

    // 4. MODO ESTÁNDAR: ÁREA (m²) -> CANTIDAD DE UNIDADES Y COSTO
    const numMatch = msgSinDimensiones.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|metros|m²|metro|m3)?/);
    const area = numMatch ? Math.max(1, parseFloat(numMatch[1].replace(',', '.'))) : 10;

    const cantidad = prod.id >= 21 ? Math.max(1, Math.ceil(area * rendimiento)) : Math.ceil(area * rendimiento);
    const subtotal = cantidad * precioUnit;

    const respuesta = `Material: ${prod.nombre} (${prod.medidas}).\nCantidad requerida para ${area} m²: ${cantidad.toLocaleString('es-CO')} unidades (incluye 7% desperdicio NSR-10; rendimiento ${rendimiento} u/m²).\nPrecio unitario: $${precioUnit.toLocaleString('es-CO')} COP.\nCosto total estimado: $${subtotal.toLocaleString('es-CO')} COP. Despacho desde Vereda Patio Bonito, Nemocón.`;

    return {
      respuesta,
      calculo: {
        modo: 'm2_a_unidades',
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

    // 2. Prompt de ingeniería para los 4 modos de consulta (Área, Cantidad de Unidades, Presupuesto COP y Recomendaciones)
    const SYSTEM_PROMPT = `Eres Ing. FES, ingeniero civil y cotizador oficial de F.E.S. Construcción (Vereda Patio Bonito, Nemocón).
CATÁLOGO OFICIAL (COP):
${catalogoStr}

RENDIMIENTOS POR m² (incluye 7% desperdicio NSR-10):
- Ladrillo pequeño (18*9*6): 56 u/m²
- Ladrillo grande (22*12*7): 38 u/m²
- Prensado Santafé / Tolete #1 / Prisma / Cocoa (24x12x6): 56 u/m²
- Prensado Macizo (24.5x12x5.5): 60 u/m²
- Bloque #4, #5 o Perf. Vert (33x23x11.5): 13 u/m²
- Bloquelón: 5 u/m²
- Tableta 20x20: 25 u/m² | Tableta 25x25: 16 u/m²
- Adoquín: 45 u/m² | Teja: 15 u/m² | Refractario: 36 u/m²
- Arena / Mixto (m³): para pañete o pega 0.02 m³ por m² (redondear a m³ entero, mínimo 1 m³).

MODOS DE RESPUESTA SEGÚN LO QUE PREGUNTE EL CLIENTE:
A) SI PREGUNTA POR ÁREA (ej: "Quiero construir 100 m²"): Calcula unidades = ceil(area * rendimiento) y costo total.
B) SI PREGUNTA POR CANTIDAD DE LADRILLOS/UNIDADES (ej: "Con 1000 ladrillos cuánto puedo construir"): Calcula cuántos m² construye (area_m2 = +(unidades / rendimiento).toFixed(1)), indica las dimensiones de un muro equivalente (2.40m de alto por X metros de largo) y el costo total de esas unidades.
C) SI PREGUNTA POR PRESUPUESTO EN DINERO (ej: "Tengo 1 millón de pesos / $1.000.000, cuánto puedo construir"): Calcula cuántas unidades puede comprar (unidades = floor(presupuesto / precio)) y cuántos m² alcanza a construir (area_m2 = +(unidades / rendimiento).toFixed(1)). Si no especifica material, compara brevemente cuánto alcanza con Ladrillo pequeño rosado vs Bloque #4 (más rendidor).
D) SI PIDE RECOMENDACIÓN DE MATERIALES (por facilidad, rapidez, economía o tipo de obra):
   - Más fácil y rápido de instalar: Bloque #4 (solo 13 u/m², 4.3 veces más rápido que el ladrillo pequeño y ahorra 60% de mezcla) o Bloquelón (5 u/m²).
   - Más económico por m²: Bloque #4 (~13.650 COP/m²) y Ladrillo pequeño rosado (~14.560 COP/m²).
   - Mejor acabado en fachada sin pañetar: Ladrillo Prensado Liviano Santafé, Prisma Gris o Cocoa.
   - Mejor para pisos: Tableta Cúcuta 20x20 o Adoquín Corbatín.
   - Mejor para hornos/chimeneas: Ladrillo Refractario 1400°C.

REGLAS DE FORMATO:
1. Sé claro, técnico y conciso (máximo 6 líneas).
2. PROHIBIDO usar símbolos Markdown o LaTeX: NO uses asteriscos (**), NO uses numerales (###), NO uses signos de fórmula (\\text o \\times), NO uses tablas (|). Escribe en texto plano y limpio.
3. Al final agrega SIEMPRE este bloque JSON exacto con el cálculo principal para que el cliente pueda agregarlo al carrito:
\`\`\`json
{"calculo":{"area_m2":17.9,"material_principal":"Nombre","unidades_estimadas":1000,"costo_total_cop":260000,"items":[{"id":2,"nombre":"Nombre","cantidad":1000,"precio_unitario":260,"subtotal":260000}]}}
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

    if (!calculoExtraido) {
      try {
        const localFallback = await cotizarLocalmente(mensaje);
        calculoExtraido = localFallback.calculo;
      } catch {
        // ignore
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
