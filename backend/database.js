const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fes_construccion',
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      connectTimeout: 4000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: (process.env.DB_SSL === 'true' || process.env.DB_PORT === '4000') ? { rejectUnauthorized: false } : undefined
    };

const pool = mysql.createPool(poolConfig);

// --- MOTOR DE CONTINGENCIA EN MEMORIA / JSON PARA NUBE (RENDER) ---
const fallbackPath = path.join(__dirname, 'data', 'productosFallback.json');
let memStore = {
  productos: [],
  pedidos: [],
  detalle_pedido: [],
  movimientos_inventario: [],
  usuarios: [],
  resenas: []
};

function loadFallbackProducts() {
  try {
    if (fs.existsSync(fallbackPath)) {
      const raw = fs.readFileSync(fallbackPath, 'utf8').replace(/^\uFEFF/, '');
      memStore.productos = JSON.parse(raw).map(p => ({
        ...p,
        id: Number(p.id),
        precio: Number(p.precio),
        stock: Number(p.stock)
      }));
    }
  } catch (err) {
    console.warn('Error cargando productosFallback.json:', err.message);
  }
}

function saveFallbackProducts() {
  try {
    fs.writeFileSync(fallbackPath, JSON.stringify(memStore.productos, null, 2), 'utf8');
  } catch (err) {
    // En contenedores de solo lectura continúa en memoria RAM
  }
}

loadFallbackProducts();

function executeFallback(sql, params = []) {
  const q = sql.replace(/\s+/g, ' ').trim();
  const qUpper = q.toUpperCase();

  // 1. PRODUCTOS - SELECT
  if (qUpper.startsWith('SELECT') && qUpper.includes('FROM PRODUCTOS')) {
    let list = [...memStore.productos];

    if (qUpper.includes('WHERE ID = ?')) {
      const id = Number(params[0]);
      list = list.filter(p => Number(p.id) === id);
      return [list];
    }

    if (qUpper.includes('WHERE STOCK > 0') && !qUpper.includes('WHERE 1=1')) {
      list = list.filter(p => Number(p.stock) > 0);
      return [list];
    }

    // Filtros dinámicos de /api/productos
    let pIdx = 0;
    if (qUpper.includes('AND CATEGORIA = ?')) {
      const cat = params[pIdx++];
      list = list.filter(p => p.categoria === cat);
    }
    if (qUpper.includes('AND (NOMBRE LIKE ?')) {
      const term = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
      pIdx += 3;
      list = list.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(term)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
        (p.medidas && p.medidas.toLowerCase().includes(term))
      );
    }
    if (qUpper.includes('AND PRECIO >= ?')) {
      const min = Number(params[pIdx++]);
      list = list.filter(p => Number(p.precio) >= min);
    }
    if (qUpper.includes('AND PRECIO <= ?')) {
      const max = Number(params[pIdx++]);
      list = list.filter(p => Number(p.precio) <= max);
    }
    if (qUpper.includes('AND STOCK > 0')) {
      list = list.filter(p => Number(p.stock) > 0);
    }

    if (qUpper.includes('ORDER BY PRECIO ASC')) {
      list.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (qUpper.includes('ORDER BY PRECIO DESC')) {
      list.sort((a, b) => Number(b.precio) - Number(a.precio));
    } else if (qUpper.includes('ORDER BY NOMBRE ASC')) {
      list.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    } else if (qUpper.includes('ORDER BY STOCK ASC')) {
      list.sort((a, b) => Number(a.stock) - Number(b.stock));
    } else {
      list.sort((a, b) => Number(a.id) - Number(b.id));
    }

    return [list];
  }

  // 2. PRODUCTOS - INSERT
  if (qUpper.startsWith('INSERT INTO PRODUCTOS')) {
    const [nombre, precio, medidas, descripcion, stock, imagen, categoria] = params;
    const nextId = memStore.productos.reduce((max, p) => Math.max(max, Number(p.id)), 0) + 1;
    const nuevo = {
      id: nextId,
      nombre,
      precio: Number(precio),
      medidas: medidas || 'Estándar',
      descripcion: descripcion || '',
      stock: Number(stock) || 0,
      imagen: imagen || '',
      categoria: categoria || 'General',
      creado_en: new Date().toISOString()
    };
    memStore.productos.push(nuevo);
    saveFallbackProducts();
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // 3. PRODUCTOS - UPDATE
  if (qUpper.startsWith('UPDATE PRODUCTOS')) {
    if (qUpper.includes('SET NOMBRE = ?')) {
      const [nombre, precio, medidas, descripcion, stock, imagen, categoria, id] = params;
      const idx = memStore.productos.findIndex(p => Number(p.id) === Number(id));
      if (idx !== -1) {
        memStore.productos[idx] = {
          ...memStore.productos[idx],
          nombre,
          precio: Number(precio),
          medidas,
          descripcion,
          stock: Number(stock),
          imagen,
          categoria
        };
        saveFallbackProducts();
      }
      return [{ affectedRows: 1 }];
    }
    if (qUpper.includes('GREATEST(0, STOCK - ?)')) {
      const [cant, id] = params;
      const idx = memStore.productos.findIndex(p => Number(p.id) === Number(id));
      if (idx !== -1) {
        memStore.productos[idx].stock = Math.max(0, Number(memStore.productos[idx].stock) - Number(cant));
        saveFallbackProducts();
      }
      return [{ affectedRows: 1 }];
    }
    if (qUpper.includes('SET STOCK = ?')) {
      const [nuevoStock, id] = params;
      const idx = memStore.productos.findIndex(p => Number(p.id) === Number(id));
      if (idx !== -1) {
        memStore.productos[idx].stock = Number(nuevoStock);
        saveFallbackProducts();
      }
      return [{ affectedRows: 1 }];
    }
    if (qUpper.includes('SET PRECIO = ?')) {
      const [nuevoPrecio, id] = params;
      const idx = memStore.productos.findIndex(p => Number(p.id) === Number(id));
      if (idx !== -1) {
        memStore.productos[idx].precio = Number(nuevoPrecio);
        saveFallbackProducts();
      }
      return [{ affectedRows: 1 }];
    }
  }

  // 4. PRODUCTOS - DELETE
  if (qUpper.startsWith('DELETE FROM PRODUCTOS')) {
    const id = Number(params[0]);
    memStore.productos = memStore.productos.filter(p => Number(p.id) !== id);
    saveFallbackProducts();
    return [{ affectedRows: 1 }];
  }

  // 5. MOVIMIENTOS INVENTARIO
  if (qUpper.startsWith('INSERT INTO MOVIMIENTOS_INVENTARIO')) {
    const nextId = memStore.movimientos_inventario.length + 1;
    if (qUpper.includes("'SALIDA'")) {
      const [producto_id, nombre_producto, cantidad, nota] = params;
      memStore.movimientos_inventario.unshift({
        id: nextId,
        producto_id,
        nombre_producto,
        tipo: 'salida',
        cantidad,
        nota,
        fecha: new Date().toISOString()
      });
    } else {
      const [producto_id, nombre_producto, tipo, cantidad, nota] = params;
      memStore.movimientos_inventario.unshift({
        id: nextId,
        producto_id,
        nombre_producto,
        tipo,
        cantidad,
        nota,
        fecha: new Date().toISOString()
      });
    }
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (qUpper.startsWith('SELECT * FROM MOVIMIENTOS_INVENTARIO')) {
    return [memStore.movimientos_inventario.slice(0, 100)];
  }

  // 6. PEDIDOS & DETALLE
  if (qUpper.startsWith('INSERT INTO PEDIDOS')) {
    const nextId = memStore.pedidos.length + 1;
    const numTotal = params.find(p => typeof p === 'number' && p > 0) || 0;
    const strNotas = params[params.length - 1] || '';
    let clienteName = 'Cliente Directo';
    let tel = '';
    let dir = '';

    if (typeof strNotas === 'string') {
      const matchName = strNotas.match(/Cliente:\s*([^|]+)/);
      if (matchName) clienteName = matchName[1].trim();
      const matchTel = strNotas.match(/Tel:\s*([^|]+)/);
      if (matchTel) tel = matchTel[1].trim();
      const matchDir = strNotas.match(/Dir:\s*([^|]+)/);
      if (matchDir) dir = matchDir[1].trim();
    }

    memStore.pedidos.unshift({
      id: nextId,
      usuario_id: params[0] || null,
      total: Number(numTotal),
      estado: 'Pendiente',
      metodo_pago: params.find(p => typeof p === 'string' && (p.includes('WhatsApp') || p.includes('Contraentrega') || p.includes('Transferencia') || p.includes('NEQUI'))) || 'WhatsApp',
      direccion_envio: dir || 'Nemocón / Sabana',
      telefono: tel || '',
      notas: strNotas,
      cliente_nombre: clienteName,
      creado_en: new Date().toISOString()
    });
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (qUpper.startsWith('INSERT INTO DETALLE_PEDIDO')) {
    const [pedido_id, producto_id, nombre_producto, cantidad, precio_unitario, subtotal] = params;
    const nextId = memStore.detalle_pedido.length + 1;
    memStore.detalle_pedido.push({
      id: nextId,
      pedido_id,
      producto_id,
      nombre_producto,
      cantidad: Number(cantidad),
      precio_unitario: Number(precio_unitario),
      subtotal: Number(subtotal)
    });
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (qUpper.startsWith('SELECT * FROM DETALLE_PEDIDO WHERE PEDIDO_ID = ?')) {
    const pid = Number(params[0]);
    return [memStore.detalle_pedido.filter(d => Number(d.pedido_id) === pid)];
  }

  if (qUpper.startsWith('UPDATE PEDIDOS SET ESTADO = ?')) {
    const [estado, id] = params;
    const p = memStore.pedidos.find(x => Number(x.id) === Number(id));
    if (p) p.estado = estado;
    return [{ affectedRows: 1 }];
  }

  if (qUpper.includes('FROM PEDIDOS') && qUpper.includes('COUNT(*) AS TOTAL_PEDIDOS')) {
    const valid = memStore.pedidos.filter(p => p.estado !== 'Cancelado');
    const ingresos = valid.reduce((s, p) => s + Number(p.total || 0), 0);
    return [[{ total_pedidos: valid.length, ingresos_totales: ingresos }]];
  }

  if (qUpper.includes('FROM PEDIDOS') && !qUpper.includes('GROUP BY')) {
    return [memStore.pedidos];
  }

  if (qUpper.includes('GROUP BY')) {
    return [[]];
  }

  // 7. USUARIOS
  if (qUpper.includes('FROM USUARIOS')) {
    const val = params[0];
    const found = memStore.usuarios.filter(u => u.email === val || u.id === val);
    return [found];
  }

  if (qUpper.startsWith('INSERT INTO USUARIOS')) {
    const [nombre, email, password, rol] = params;
    const nextId = memStore.usuarios.length + 2;
    memStore.usuarios.push({ id: nextId, nombre, email, password, rol, creado_en: new Date().toISOString() });
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // 8. RESEÑAS
  if (qUpper.startsWith('SELECT') && qUpper.includes('FROM RESENAS')) {
    return [[...memStore.resenas].sort((a, b) => Number(b.id) - Number(a.id))];
  }

  if (qUpper.startsWith('INSERT INTO RESENAS')) {
    const [nombre, cargo, estrellas, comentario] = params;
    const nextId = memStore.resenas.reduce((max, r) => Math.max(max, Number(r.id)), 0) + 1;
    const nueva = {
      id: nextId,
      nombre,
      cargo: cargo || 'Cliente F.E.S. Construcción',
      estrellas: Number(estrellas) || 5,
      comentario,
      creado_en: new Date().toISOString()
    };
    memStore.resenas.unshift(nueva);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (qUpper.startsWith('DELETE FROM RESENAS')) {
    const id = Number(params[0]);
    memStore.resenas = memStore.resenas.filter(r => Number(r.id) !== id);
    return [{ affectedRows: 1 }];
  }

  return [[]];
}

const db = {
  async execute(sql, params = []) {
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      return executeFallback(sql, params);
    }
  },
  async query(sql, params = []) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      return executeFallback(sql, params);
    }
  },
  async getConnection() {
    try {
      return await pool.getConnection();
    } catch (err) {
      return {
        beginTransaction: async () => {},
        execute: async (sql, params = []) => executeFallback(sql, params),
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      };
    }
  }
};

// Test inicial no bloqueante y auto-migración segura
pool.getConnection()
  .then(async (conn) => {
    console.log('✅ Conexión exitosa a MySQL (fes_construccion)');
    try {
      const [cols] = await conn.query("SHOW COLUMNS FROM pedidos");
      if (Array.isArray(cols)) {
        const names = new Set(cols.map(c => (c.Field || '').toLowerCase()));
        if (!names.has('direccion_envio')) {
          await conn.query("ALTER TABLE pedidos ADD COLUMN direccion_envio VARCHAR(255) NULL");
        }
        if (!names.has('telefono')) {
          await conn.query("ALTER TABLE pedidos ADD COLUMN telefono VARCHAR(50) NULL");
        }
        if (!names.has('cliente_nombre')) {
          await conn.query("ALTER TABLE pedidos ADD COLUMN cliente_nombre VARCHAR(150) NULL");
        }
      }
    } catch (migErr) {
      console.warn('Nota de verificación de columnas:', migErr.message);
    }
    conn.release();
  })
  .catch(() => {
    console.log('ℹ️ Modo Cloud / Contingencia Activo: usando catálogo integrado (23 productos)');
  });

module.exports = db;
