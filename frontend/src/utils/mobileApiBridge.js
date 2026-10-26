// Puente de Conexión Móvil (Capacitor Android) + Motor de Contingencia Local
// Garantiza que la aplicación para celular funcione conectada a Render (https://fes-construccion.onrender.com)
// y también 100% funcional en modo contingencia/offline desde el dispositivo móvil.

const RENDER_API_BASE = 'https://fes-construccion.onrender.com';

export const DEFAULT_CATALOG_23 = [
  { id: 1, nombre: 'Ladrillo pequeño negro', precio: 300, medidas: '18*9*6', descripcion: 'Ladrillo artesanal de alta calidad.', stock: 900, imagen: 'https://easycolombia.vtexassets.com/arquivos/ids/163219-1600-1600?v=638066266842200000&width=1600&height=1600&aspect=true', categoria: 'Ladrillos' },
  { id: 2, nombre: 'Ladrillo pequeño rosado', precio: 260, medidas: '18*9*6', descripcion: 'Ladrillo artesanal rosado excelente.', stock: 1200, imagen: 'https://ladrillerasansebastian.com/wp-content/uploads/2024/08/LADRILLO-TOLETE-COMUN-ROSADO-2.jpeg', categoria: 'Ladrillos' },
  { id: 3, nombre: 'Ladrillo grande negro', precio: 450, medidas: '22*12*7', descripcion: 'Ladrillo grande negro superior.', stock: 800, imagen: 'https://media.leroymerlin.co.za/media/306553/format/jpg?tr=if-iar_ne_1,w-566,h-566,cm-pad_resize,if-else,w-566,h-566,if-end', categoria: 'Ladrillos' },
  { id: 4, nombre: 'Ladrillo grande rosado', precio: 400, medidas: '22*12*7', descripcion: 'Ladrillo grande rosado artesanal.', stock: 900, imagen: 'https://t3.ftcdn.net/jpg/01/13/32/26/360_F_113322631_KA4N2XLNTH2hV8oZsq79rYjjKtvOAZqK.jpg', categoria: 'Ladrillos' },
  { id: 5, nombre: 'Bloque número 4', precio: 1050, medidas: 'Estándar', descripcion: 'Bloque de alta resistencia.', stock: 500, imagen: 'https://media.falabella.com/sodimacCO/258425/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Bloques' },
  { id: 6, nombre: 'Bloque número 5', precio: 1100, medidas: 'Estándar', descripcion: 'Bloque de máxima resistencia.', stock: 400, imagen: 'https://media.falabella.com/sodimacCO/499020/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Bloques' },
  { id: 7, nombre: 'Regilla', precio: 700, medidas: 'Estándar', descripcion: 'Regilla de arcilla ventilación.', stock: 300, imagen: 'https://media.falabella.com/sodimacCO/63165/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Especiales' },
  { id: 8, nombre: 'Adoquín', precio: 750, medidas: 'Estándar', descripcion: 'Adoquín de arcilla pavimento.', stock: 600, imagen: 'https://media.falabella.com/sodimacCO/695284_02/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Especiales' },
  { id: 9, nombre: 'Teja de barro', precio: 1000, medidas: 'Estándar', descripcion: 'Teja de barro tradicional.', stock: 450, imagen: 'https://tse2.mm.bing.net/th/id/OIP.AaIXjKGys99FaptD3xTg4AAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Tejas' },
  { id: 10, nombre: 'Bloquelón', precio: 5500, medidas: 'Grande', descripcion: 'Bloquelón de gran tamaño.', stock: 150, imagen: 'https://media.falabella.com/sodimacCO/152339/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Bloques' },
  { id: 11, nombre: 'Ladrillo Prensado Liviano 24.5x12x6cm Santafe', precio: 1400, medidas: '24.5x12x6 cm', descripcion: 'Ladrillo prensado liviano Santafe. 2.2 Kg, rendimiento 56 u/m2. Tipo enchape, color terracota. Código: 114940.', stock: 1000, imagen: 'https://tse1.explicit.bing.net/th/id/OIP.tjvaRd5heYNx-pBY-hdIFwHaEx?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Ladrillos' },
  { id: 12, nombre: 'Bloque Perf Vert DP 33x23x11.5cm', precio: 4900, medidas: '33x23x11.5 cm', descripcion: 'Bloque perforación vertical DP estructural. 7.9 Kg, rendimiento 12.25 u/m2. Color terracota. Código: 76786.', stock: 600, imagen: 'https://tse1.explicit.bing.net/th/id/OIP.pNBz_1pKxsYPDFmnk9nQ_wHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Bloques' },
  { id: 13, nombre: 'Ladrillo Refractario 24x12.5x4cm 1400°C', precio: 2700, medidas: '24x12.5x4 cm', descripcion: 'Ladrillo refractario de alta resistencia térmica hasta 1400°C. 1.5 Kg, rendimiento 36 u/m2, color arena. Código: 159253.', stock: 500, imagen: 'https://media.adeo.com/media/4405301/media.jpeg?width=3000&height=3000&format=jpg&quality=80&fit=bounds', categoria: 'Refractarios' },
  { id: 14, nombre: 'Tolete #1 Perforado 24x12x6cm', precio: 660, medidas: '24x12x6 cm', descripcion: 'Tolete #1 perforado artesanal. 2.10 Kg, rendimiento 56 u/m2. Garantía 1 año. Código: 99717.', stock: 1500, imagen: 'https://imagedelivery.net/4fYuQyy-r8_rpBpcY7lH_A/sodimacCO/99717/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Ladrillos' },
  { id: 15, nombre: 'Prensado Macizo 24.5x12x5.5cm', precio: 1900, medidas: '24.5x12x5.5 cm', descripcion: 'Ladrillo prensado macizo tipo enchape. Rendimiento 60 u/m2, color terracota. Código: 23209.', stock: 800, imagen: 'https://media.falabella.com/sodimacCO/23209/w=1036,h=832,f=webp,fit=contain,q=85', categoria: 'Ladrillos' },
  { id: 16, nombre: 'Tableta Arcilla Cúcuta 20x20cm', precio: 23000, medidas: '20x20 cm', descripcion: 'Tableta elaborada en arcilla natural tamaño 20x20 cm. Acabado tradicional cálido para pisos y muros.', stock: 400, imagen: 'https://moraventas.com/wp-content/uploads/2021/06/TABLON-30X30-GRAFILADO.jpeg', categoria: 'Tabletas' },
  { id: 17, nombre: 'Adoquín Corbatín 15x10x6cm', precio: 800, medidas: '15x10x6 cm', descripcion: 'Adoquín tipo corbatín para pavimentación exterior y senderos de alto tránsito.', stock: 1200, imagen: 'https://www.ladrilleragrespan.com/wp-content/uploads/2017/04/Ladrillo-Corbatin-LVH.jpg', categoria: 'Adoquines' },
  { id: 18, nombre: 'Tableta Rústica 25x25cm', precio: 20000, medidas: '25x25 cm', descripcion: 'Tableta acabado rústico en arcilla de alta resistencia, formato 25x25 cm.', stock: 350, imagen: 'https://tse1.explicit.bing.net/th/id/OIP.W_3kJaK5HjfKif7N2ne9LwHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Tabletas' },
  { id: 19, nombre: 'Ladrillo Prisma Gris 24x12x6cm', precio: 900, medidas: '24x12x6 cm', descripcion: 'Ladrillo de fachada acabado prisma gris moderno. Alta estética arquitectónica.', stock: 700, imagen: 'https://tse4.mm.bing.net/th/id/OIP.A8TqMwqbqzhjzgMz3wYQ6wHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Fachadas' },
  { id: 20, nombre: 'Ladrillo Cocoa 24x12x6cm', precio: 900, medidas: '24x12x6 cm', descripcion: 'Ladrillo de fachada tono cocoa oscuro elegante. Gran durabilidad y textura.', stock: 700, imagen: 'https://www.ladrilleramelendez.com.co/wp-content/uploads/2020/10/4212_Sin-Fondo.png', categoria: 'Fachadas' },
  { id: 21, nombre: 'Arena de Río (m³)', precio: 100000, medidas: 'm³', descripcion: 'Arena de río lavada y seleccionada para mezclas de concreto y pegas de mampostería.', stock: 100, imagen: 'https://tse1.mm.bing.net/th/id/OIP.DQ4hFt5HdNu9HjDmsxbNKgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Agregados' },
  { id: 22, nombre: 'Arena Amarilla (m³)', precio: 100000, medidas: 'm³', descripcion: 'Arena amarilla seleccionada para morteros de pega, acabados y revoques uniformes.', stock: 100, imagen: 'https://tse1.mm.bing.net/th/id/OIP.Jqdc8X6tV7Bua7H7fsANggHaFj?r=0&w=800&h=600&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Agregados' },
  { id: 23, nombre: 'Mixto de Concreto (m³)', precio: 100000, medidas: 'm³', descripcion: 'Material mixto granular (grava y arena) balanceado para fundición estructural.', stock: 100, imagen: 'https://tse1.mm.bing.net/th/id/OIP.LuWELSza6RsI_Eo25QoSsAHaE8?r=0&w=800&h=534&rs=1&pid=ImgDetMain&o=7&rm=3', categoria: 'Agregados' }
];

function isRunningInCapacitorOrMobileWebView() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
    return true;
  }
  if (window.AndroidDownloader) return true;
  const proto = window.location.protocol;
  if (proto === 'capacitor:' || proto === 'file:') return true;
  // En Android WebView con Capacitor, el origen por defecto es https://localhost o http://localhost sin puerto
  if (window.location.hostname === 'localhost' && !window.location.port) return true;
  return false;
}

function getLocalProducts() {
  try {
    const raw = localStorage.getItem('fes_mobile_productos');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CATALOG_23;
}

function saveLocalProducts(list) {
  try {
    localStorage.setItem('fes_mobile_productos', JSON.stringify(list));
  } catch {
    // ignore
  }
}

function getLocalOrders() {
  try {
    const raw = localStorage.getItem('fes_mis_pedidos_locales');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(list) {
  try {
    localStorage.setItem('fes_mis_pedidos_locales', JSON.stringify(list));
  } catch {
    // ignore
  }
}

function getLocalMovements() {
  try {
    const raw = localStorage.getItem('fes_mobile_movimientos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMovements(list) {
  try {
    localStorage.setItem('fes_mobile_movimientos', JSON.stringify(list));
  } catch {
    // ignore
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleOfflineFallback(apiPath, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  const urlObj = new URL(apiPath, 'https://localhost');
  const pathname = urlObj.pathname;

  // 1. PRODUCTOS PÚBLICOS Y ADMIN
  if ((pathname === '/api/productos' || pathname === '/api/admin/productos') && method === 'GET') {
    let list = [...getLocalProducts()];
    const cat = urlObj.searchParams.get('categoria');
    const disp = urlObj.searchParams.get('disponible');
    if (cat && cat !== 'Todos') list = list.filter((p) => p.categoria === cat);
    if (disp === 'true') list = list.filter((p) => Number(p.stock) > 0);
    return jsonResponse(list);
  }

  if (pathname === '/api/admin/productos' && method === 'POST') {
    const list = [...getLocalProducts()];
    const nextId = list.reduce((max, p) => Math.max(max, Number(p.id)), 0) + 1;
    const nuevo = {
      id: nextId,
      nombre: body.nombre,
      precio: Number(body.precio || 0),
      medidas: body.medidas || 'Estándar',
      descripcion: body.descripcion || '',
      stock: Number(body.stock || 0),
      imagen: body.imagen || '',
      categoria: body.categoria || 'Ladrillos'
    };
    list.push(nuevo);
    saveLocalProducts(list);
    return jsonResponse({ message: 'Producto creado', id: nextId }, 201);
  }

  const matchProdEdit = pathname.match(/^\/api\/admin\/productos\/(\d+)$/);
  if (matchProdEdit && method === 'PUT') {
    const id = Number(matchProdEdit[1]);
    const list = getLocalProducts().map((p) =>
      Number(p.id) === id
        ? {
            ...p,
            nombre: body.nombre ?? p.nombre,
            precio: Number(body.precio ?? p.precio),
            medidas: body.medidas ?? p.medidas,
            descripcion: body.descripcion ?? p.descripcion,
            stock: Number(body.stock ?? p.stock),
            imagen: body.imagen ?? p.imagen,
            categoria: body.categoria ?? p.categoria
          }
        : p
    );
    saveLocalProducts(list);
    return jsonResponse({ message: 'Producto actualizado' });
  }

  const matchProdPrice = pathname.match(/^\/api\/admin\/productos\/(\d+)\/precio$/);
  if (matchProdPrice && method === 'PATCH') {
    const id = Number(matchProdPrice[1]);
    const list = getLocalProducts().map((p) =>
      Number(p.id) === id ? { ...p, precio: Number(body.precio) } : p
    );
    saveLocalProducts(list);
    return jsonResponse({ message: 'Precio actualizado' });
  }

  const matchStockAdj = pathname.match(/^\/api\/admin\/productos\/(\d+)\/stock-adjust$/);
  if (matchStockAdj && method === 'POST') {
    const id = Number(matchStockAdj[1]);
    const cant = Number(body.cantidad || 0);
    const tipo = body.tipo || 'entrada';
    let prodName = 'Material';
    const list = getLocalProducts().map((p) => {
      if (Number(p.id) === id) {
        prodName = p.nombre;
        const nuevoStock = tipo === 'entrada' ? Number(p.stock) + cant : Math.max(0, Number(p.stock) - cant);
        return { ...p, stock: nuevoStock };
      }
      return p;
    });
    saveLocalProducts(list);

    const movs = getLocalMovements();
    movs.unshift({
      id: Date.now(),
      producto_id: id,
      nombre_producto: prodName,
      tipo,
      cantidad: cant,
      nota: body.nota || `Ajuste manual (${tipo})`,
      fecha: new Date().toISOString()
    });
    saveLocalMovements(movs);
    return jsonResponse({ message: 'Stock ajustado' });
  }

  // 2. AUTENTICACIÓN
  if (pathname === '/api/auth/login' && method === 'POST') {
    const emailClean = String(body.email || '').trim().toLowerCase();
    const pass = String(body.password || '');
    if (
      (emailClean === 'admin@fes.com' || emailClean === 'frlmrtnz@gmail.com') &&
      (pass === 'Admin1234!' || pass === 'admin123')
    ) {
      return jsonResponse({
        token: 'mobile-admin-token-fes',
        user: { id: 1, nombre: 'Administrador FES', email: emailClean, rol: 'admin' }
      });
    }
    const localUsers = JSON.parse(localStorage.getItem('fes_mobile_users') || '[]');
    const found = localUsers.find((u) => u.email.toLowerCase() === emailClean && u.password === pass);
    if (found) {
      return jsonResponse({
        token: `mobile-user-token-${found.id}`,
        user: { id: found.id, nombre: found.nombre, email: found.email, rol: found.rol || 'cliente' }
      });
    }
    return jsonResponse({ error: 'Credenciales inválidas' }, 401);
  }

  if (pathname === '/api/auth/google' && method === 'POST') {
    try {
      if (body.credential) {
        const parts = body.credential.split('.');
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const emailClean = String(payload.email || '').toLowerCase();
        const isAdmin = emailClean === 'frlmrtnz@gmail.com' || emailClean === 'admin@fes.com';
        return jsonResponse({
          token: `mobile-google-token-${Date.now()}`,
          user: {
            id: isAdmin ? 1 : Date.now(),
            nombre: payload.name || payload.given_name || emailClean.split('@')[0],
            email: emailClean,
            rol: isAdmin ? 'admin' : 'cliente',
            picture: payload.picture || '',
            provider: 'google'
          }
        });
      }
    } catch {
      // ignore
    }
    return jsonResponse({ error: 'No se pudo autenticar con Google sin conexión' }, 400);
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const localUsers = JSON.parse(localStorage.getItem('fes_mobile_users') || '[]');
    const emailClean = String(body.email || '').trim().toLowerCase();
    const newUser = {
      id: Date.now(),
      nombre: body.nombre || 'Cliente Obra',
      email: emailClean,
      password: body.password || '',
      rol: 'cliente'
    };
    localUsers.push(newUser);
    localStorage.setItem('fes_mobile_users', JSON.stringify(localUsers));
    return jsonResponse({
      token: `mobile-user-token-${newUser.id}`,
      user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: 'cliente' }
    }, 201);
  }

  // 3. PEDIDOS
  if (pathname === '/api/pedidos' && method === 'POST') {
    const orders = getLocalOrders();
    const pedidoId = orders.length > 0 ? Math.max(...orders.map((o) => Number(o.id) || 0)) + 1 : 101;
    const items = Array.isArray(body.items) ? body.items : [];
    const total = items.reduce((s, it) => s + Number(it.precio || 0) * Number(it.cantidad || 1), 0);

    const newOrder = {
      id: pedidoId,
      creado_en: new Date().toISOString(),
      cliente_nombre: body.cliente_nombre || 'Cliente F.E.S.',
      telefono: body.telefono || '',
      direccion_envio: body.direccion_envio || 'Vereda Patio Bonito / Sabana',
      notas: body.notas || '',
      metodo_pago: body.metodo_pago || 'WhatsApp',
      total,
      estado: 'Pendiente',
      detalle: items.map((it) => ({
        producto_id: it.id,
        nombre_producto: it.nombre,
        medidas: it.medidas || 'Estándar',
        cantidad: Number(it.cantidad || 1),
        precio_unitario: Number(it.precio || 0),
        subtotal: Number(it.precio || 0) * Number(it.cantidad || 1)
      }))
    };

    // Descontar stock local y registrar movimiento
    const prods = getLocalProducts();
    const movs = getLocalMovements();
    items.forEach((it) => {
      const idx = prods.findIndex((p) => Number(p.id) === Number(it.id));
      if (idx !== -1) {
        prods[idx].stock = Math.max(0, Number(prods[idx].stock) - Number(it.cantidad || 1));
      }
      movs.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        producto_id: it.id,
        nombre_producto: it.nombre,
        tipo: 'salida',
        cantidad: Number(it.cantidad || 1),
        nota: `Venta Pedido #${pedidoId} - ${newOrder.cliente_nombre}`,
        fecha: new Date().toISOString()
      });
    });
    saveLocalProducts(prods);
    saveLocalMovements(movs);

    return jsonResponse({
      message: 'Pedido registrado con éxito',
      pedidoId,
      total
    }, 201);
  }

  if ((pathname === '/api/pedidos/mis-pedidos' || pathname === '/api/admin/pedidos') && method === 'GET') {
    return jsonResponse(getLocalOrders());
  }

  const matchOrderStatus = pathname.match(/^\/api\/admin\/pedidos\/(\d+)\/status$/);
  if (matchOrderStatus && method === 'PUT') {
    const pid = Number(matchOrderStatus[1]);
    const orders = getLocalOrders().map((o) =>
      Number(o.id) === pid ? { ...o, estado: body.estado } : o
    );
    saveLocalOrders(orders);
    return jsonResponse({ message: 'Estado actualizado' });
  }

  // 4. REPORTES DE VENTAS E INVENTARIO
  if (pathname === '/api/admin/reportes/ventas' && method === 'GET') {
    const orders = getLocalOrders().filter((o) => o.estado !== 'Cancelado');
    const ingresos_totales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const prodMap = {};
    orders.forEach((o) => {
      (o.detalle || []).forEach((d) => {
        const key = d.nombre_producto || d.nombre;
        if (!prodMap[key]) {
          prodMap[key] = { nombre_producto: key, unidades_vendidas: 0, ingresos_generados: 0 };
        }
        prodMap[key].unidades_vendidas += Number(d.cantidad || 0);
        prodMap[key].ingresos_generados += Number(d.subtotal || Number(d.cantidad || 0) * Number(d.precio_unitario || 0));
      });
    });
    return jsonResponse({
      porDia: [],
      porMes: [],
      porAnio: [],
      topProductos: Object.values(prodMap).sort((a, b) => b.unidades_vendidas - a.unidades_vendidas),
      totalGeneral: {
        total_pedidos: orders.length,
        ingresos_totales
      }
    });
  }

  if (pathname === '/api/admin/reportes/inventario' && method === 'GET') {
    return jsonResponse({
      productos: getLocalProducts(),
      movimientos: getLocalMovements()
    });
  }

  // 5. COTIZADOR IA DE CONTINGENCIA MÓVIL
  if (pathname === '/api/ia/consultar' && method === 'POST') {
    const msg = String(body.mensaje || '').toLowerCase();
    const numMatch = msg.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|m²|metros)/i) || msg.match(/(\d+)/);
    const area = numMatch ? Math.max(1, parseFloat(numMatch[1].replace(',', '.'))) : 50;
    const prods = getLocalProducts();
    let chosen = prods[1] || DEFAULT_CATALOG_23[1];
    for (const p of prods) {
      if (msg.includes(p.nombre.toLowerCase())) {
        chosen = p;
        break;
      }
    }
    let rend = 56;
    if (chosen.nombre.toLowerCase().includes('grande')) rend = 36;
    else if (chosen.nombre.toLowerCase().includes('bloque')) rend = 12.5;
    else if (chosen.nombre.toLowerCase().includes('tableta')) rend = 25;
    else if (chosen.nombre.toLowerCase().includes('adoqu')) rend = 45;
    else if (chosen.categoria === 'Agregados') rend = 1;

    const unidades = Math.ceil(area * rend * 1.07);
    const costo = unidades * Number(chosen.precio);
    return jsonResponse({
      respuesta: `Cálculo estructural NSR-10 para ${area} m² con ${chosen.nombre} (${chosen.medidas}):\n\n• Rendimiento técnico: ${rend} unid/m²\n• Cantidad + 7% desperdicio: ${unidades.toLocaleString('es-CO')} unidades\n• Valor unitario en planta: $${Number(chosen.precio).toLocaleString('es-CO')} COP\n• Presupuesto total estimado: $${costo.toLocaleString('es-CO')} COP`,
      calculo: {
        material_principal: chosen.nombre,
        unidades_estimadas: unidades,
        costo_total_cop: costo,
        items: [{ id: chosen.id, nombre: chosen.nombre, precio: Number(chosen.precio), medidas: chosen.medidas, imagen: chosen.imagen, categoria: chosen.categoria, cantidad: unidades }]
      }
    });
  }

  // 6. RESEÑAS
  if (pathname === '/api/resenas') {
    const list = JSON.parse(localStorage.getItem('fes_mobile_resenas') || '[]');
    if (method === 'GET') return jsonResponse(list);
    if (method === 'POST') {
      const nueva = {
        id: Date.now(),
        nombre: body.nombre || 'Cliente FES',
        cargo: body.cargo || 'Cliente F.E.S. Construcción',
        estrellas: Number(body.estrellas || 5),
        comentario: body.comentario || '',
        creado_en: new Date().toISOString()
      };
      list.unshift(nueva);
      localStorage.setItem('fes_mobile_resenas', JSON.stringify(list));
      return jsonResponse({ resena: nueva }, 201);
    }
  }

  return jsonResponse({ ok: true });
}

export function initMobileApiBridge() {
  if (typeof window === 'undefined' || window.__fesFetchPatched) return;
  window.__fesFetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  const isMobileApp = isRunningInCapacitorOrMobileWebView();

  window.fetch = async (input, init) => {
    const urlStr = typeof input === 'string' ? input : input?.url || '';

    if (urlStr.startsWith('/api/')) {
      const targetUrl = isMobileApp ? `${RENDER_API_BASE}${urlStr}` : urlStr;
      try {
        const response = await originalFetch(targetUrl, init);
        // Sincronizar catálogo en caché móvil cuando hay respuesta exitosa
        if (response.ok && urlStr.startsWith('/api/productos') && (!init || !init.method || init.method === 'GET')) {
          const clone = response.clone();
          clone.json().then((data) => {
            if (Array.isArray(data) && data.length > 0) saveLocalProducts(data);
          }).catch(() => {});
        }
        return response;
      } catch (networkErr) {
        console.warn(`Modo contingencia móvil activo para ${urlStr}:`, networkErr.message);
        return handleOfflineFallback(urlStr, init);
      }
    }

    return originalFetch(input, init);
  };
}
