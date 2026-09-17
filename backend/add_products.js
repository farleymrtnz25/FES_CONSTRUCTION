const mysql = require('mysql2/promise');
require('dotenv').config();

const newProducts = [
  {
    nombre: 'Ladrillo Prensado Liviano 24.5x12x6cm Santafe',
    precio: 1400.00,
    medidas: '24.5x12x6 cm',
    categoria: 'Ladrillos',
    descripcion: 'Ladrillo prensado liviano Santafe. 2.2 Kg, rendimiento 56 u/m2. Tipo enchape, color terracota. Código: 114940.',
    stock: 1000,
    imagen: 'https://placehold.co/400x300/b45309/ffffff?text=Ladrillo+Prensado+Liviano'
  },
  {
    nombre: 'Bloque Perf Vert DP 33x23x11.5cm',
    precio: 4900.00,
    medidas: '33x23x11.5 cm',
    categoria: 'Bloques',
    descripcion: 'Bloque perforación vertical DP estructural. 7.9 Kg, rendimiento 12.25 u/m2. Color terracota. Código: 76786.',
    stock: 600,
    imagen: 'https://placehold.co/400x300/9a3412/ffffff?text=Bloque+Perf+Vert'
  },
  {
    nombre: 'Ladrillo Refractario 24x12.5x4cm 1400°C',
    precio: 2700.00,
    medidas: '24x12.5x4 cm',
    categoria: 'Refractarios',
    descripcion: 'Ladrillo refractario de alta resistencia térmica hasta 1400°C. 1.5 Kg, rendimiento 36 u/m2, color arena. Código: 159253.',
    stock: 500,
    imagen: 'https://placehold.co/400x300/d97706/ffffff?text=Ladrillo+Refractario'
  },
  {
    nombre: 'Tolete #1 Perforado 24x12x6cm',
    precio: 660.00,
    medidas: '24x12x6 cm',
    categoria: 'Ladrillos',
    descripcion: 'Tolete #1 perforado artesanal. 2.10 Kg, rendimiento 56 u/m2. Garantía 1 año. Código: 99717.',
    stock: 1500,
    imagen: 'https://placehold.co/400x300/c2410c/ffffff?text=Tolete+Perforado'
  },
  {
    nombre: 'Prensado Macizo 24.5x12x5.5cm',
    precio: 1900.00,
    medidas: '24.5x12x5.5 cm',
    categoria: 'Ladrillos',
    descripcion: 'Ladrillo prensado macizo tipo enchape. Rendimiento 60 u/m2, color terracota. Código: 23209.',
    stock: 800,
    imagen: 'https://placehold.co/400x300/b45309/ffffff?text=Prensado+Macizo'
  },
  {
    nombre: 'Tableta Arcilla Cúcuta 20x20cm',
    precio: 23000.00,
    medidas: '20x20 cm',
    categoria: 'Tabletas',
    descripcion: 'Tableta elaborada en arcilla natural tamaño 20x20 cm. Acabado tradicional cálido para pisos y muros.',
    stock: 400,
    imagen: 'https://placehold.co/400x300/ea580c/ffffff?text=Tableta+Cucuta'
  },
  {
    nombre: 'Adoquín Corbatín 15x10x6cm',
    precio: 800.00,
    medidas: '15x10x6 cm',
    categoria: 'Adoquines',
    descripcion: 'Adoquín tipo corbatín para pavimentación exterior y senderos de alto tránsito vehicular y peatonal.',
    stock: 1200,
    imagen: 'https://placehold.co/400x300/78716c/ffffff?text=Adoquin+Corbatin'
  },
  {
    nombre: 'Tableta Rústica 25x25cm',
    precio: 20000.00,
    medidas: '25x25 cm',
    categoria: 'Tabletas',
    descripcion: 'Tableta acabado rústico en arcilla de alta resistencia, formato 25x25 cm para exteriores e interiores.',
    stock: 350,
    imagen: 'https://placehold.co/400x300/c2410c/ffffff?text=Tableta+Rustica'
  },
  {
    nombre: 'Ladrillo Prisma Gris 24x12x6cm',
    precio: 900.00,
    medidas: '24x12x6 cm',
    categoria: 'Fachadas',
    descripcion: 'Ladrillo de fachada acabado prisma gris moderno. Alta estética arquitectónica.',
    stock: 700,
    imagen: 'https://placehold.co/400x300/64748b/ffffff?text=Prisma+Gris'
  },
  {
    nombre: 'Ladrillo Cocoa 24x12x6cm',
    precio: 900.00,
    medidas: '24x12x6 cm',
    categoria: 'Fachadas',
    descripcion: 'Ladrillo de fachada tono cocoa oscuro elegante. Gran durabilidad y textura a la vista.',
    stock: 700,
    imagen: 'https://placehold.co/400x300/78350f/ffffff?text=Ladrillo+Cocoa'
  },
  // Agregados separados
  {
    nombre: 'Arena de Río (m³)',
    precio: 100000.00,
    medidas: 'm³ (Metro Cúbico)',
    categoria: 'Agregados',
    descripcion: 'Arena de río lavada y seleccionada de alta pureza para mezclas de concreto, mampostería y pañetes.',
    stock: 100,
    imagen: 'https://placehold.co/400x300/a8a29e/ffffff?text=Arena+de+Rio'
  },
  {
    nombre: 'Arena Amarilla (m³)',
    precio: 100000.00,
    medidas: 'm³ (Metro Cúbico)',
    categoria: 'Agregados',
    descripcion: 'Arena amarilla seleccionada y cernida para morteros de pega, acabados finos y revoques uniformes.',
    stock: 100,
    imagen: 'https://placehold.co/400x300/ca8a04/ffffff?text=Arena+Amarilla'
  },
  {
    nombre: 'Mixto de Concreto (m³)',
    precio: 100000.00,
    medidas: 'm³ (Metro Cúbico)',
    categoria: 'Agregados',
    descripcion: 'Material mixto granular (grava y arena) listo para fundición estructural de placas, zapatas, vigas y columnas.',
    stock: 100,
    imagen: 'https://placehold.co/400x300/57534e/ffffff?text=Mixto+Concreto'
  }
];

async function insertIntoDb(config, label) {
  console.log(`\n⏳ Conectando a ${label}...`);
  try {
    const conn = await mysql.createConnection(config);
    console.log(`✅ Conectado a ${label}`);

    for (const p of newProducts) {
      // Check if already exists by name
      const [existing] = await conn.execute('SELECT id FROM productos WHERE nombre = ?', [p.nombre]);
      if (existing.length > 0) {
        await conn.execute(
          'UPDATE productos SET precio=?, medidas=?, categoria=?, descripcion=?, stock=?, imagen=? WHERE id=?',
          [p.precio, p.medidas, p.categoria, p.descripcion, p.stock, p.imagen, existing[0].id]
        );
        console.log(`🔄 Actualizado: ${p.nombre} [${p.categoria}] - $${p.precio}`);
      } else {
        await conn.execute(
          'INSERT INTO productos (nombre, precio, medidas, categoria, descripcion, stock, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.nombre, p.precio, p.medidas, p.categoria, p.descripcion, p.stock, p.imagen]
        );
        console.log(`✨ Insertado: ${p.nombre} [${p.categoria}] - $${p.precio}`);
      }
    }

    const [total] = await conn.execute('SELECT COUNT(*) as c FROM productos');
    console.log(`🎉 Total de productos en ${label}: ${total[0].c}`);
    await conn.end();
  } catch (err) {
    console.error(`❌ Error en ${label}:`, err.message);
  }
}

async function main() {
  // 1. TiDB Cloud (Producción)
  await insertIntoDb({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3taWuA3YripVimE.root',
    password: '4LGZYjlakLtYXRGS',
    database: 'test',
    ssl: { rejectUnauthorized: false }
  }, 'TiDB Cloud (Nube / Producción)');

  // 2. MySQL Local (si está activo)
  await insertIntoDb({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fes_construccion'
  }, 'MySQL Local');
}

main().then(() => process.exit(0));
