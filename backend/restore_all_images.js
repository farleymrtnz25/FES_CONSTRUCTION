const mysql = require('mysql2/promise');

const all23Products = [
  {
    id: 1,
    nombre: 'Ladrillo pequeño negro',
    precio: 300.00,
    medidas: '18*9*6',
    descripcion: 'Ladrillo artesanal de alta calidad fabricado con arcilla seleccionada.',
    stock: 900,
    categoria: 'Ladrillos',
    imagen: 'https://easycolombia.vtexassets.com/arquivos/ids/163219-1600-1600?v=638066266842200000&width=1600&height=1600&aspect=true'
  },
  {
    id: 2,
    nombre: 'Ladrillo pequeño rosado',
    precio: 260.00,
    medidas: '18*9*6',
    descripcion: 'Ladrillo artesanal rosado excelente toque tradicional.',
    stock: 1200,
    categoria: 'Ladrillos',
    imagen: 'https://ladrillerasansebastian.com/wp-content/uploads/2024/08/LADRILLO-TOLETE-COMUN-ROSADO-2.jpeg'
  },
  {
    id: 3,
    nombre: 'Ladrillo grande negro',
    precio: 450.00,
    medidas: '22*12*7',
    descripcion: 'Ladrillo grande negro superior resistencia estructural.',
    stock: 800,
    categoria: 'Ladrillos',
    imagen: 'https://media.leroymerlin.co.za/media/306553/format/jpg?tr=if-iar_ne_1,w-566,h-566,cm-pad_resize,if-else,w-566,h-566,if-end'
  },
  {
    id: 4,
    nombre: 'Ladrillo grande rosado',
    precio: 400.00,
    medidas: '22*12*7',
    descripcion: 'Ladrillo grande rosado artesanal excelente calidad.',
    stock: 900,
    categoria: 'Ladrillos',
    imagen: 'https://t3.ftcdn.net/jpg/01/13/32/26/360_F_113322631_KA4N2XLNTH2hV8oZsq79rYjjKtvOAZqK.jpg'
  },
  {
    id: 5,
    nombre: 'Bloque número 4',
    precio: 1050.00,
    medidas: 'Estándar',
    descripcion: 'Bloque de alta resistencia para muros estructurales.',
    stock: 500,
    categoria: 'Bloques',
    imagen: 'https://media.falabella.com/sodimacCO/258425/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 6,
    nombre: 'Bloque número 5',
    precio: 1100.00,
    medidas: 'Estándar',
    descripcion: 'Bloque de máxima resistencia para proyectos exigentes.',
    stock: 400,
    categoria: 'Bloques',
    imagen: 'https://media.falabella.com/sodimacCO/499020/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 7,
    nombre: 'Regilla',
    precio: 700.00,
    medidas: 'Estándar',
    descripcion: 'Regilla de arcilla para ventilación y decoración.',
    stock: 300,
    categoria: 'Especiales',
    imagen: 'https://media.falabella.com/sodimacCO/63165/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 8,
    nombre: 'Adoquín',
    precio: 750.00,
    medidas: 'Estándar',
    descripcion: 'Adoquín de arcilla para pavimentación exterior resistente.',
    stock: 600,
    categoria: 'Especiales',
    imagen: 'https://media.falabella.com/sodimacCO/695284_02/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 9,
    nombre: 'Teja de barro',
    precio: 1000.00,
    medidas: 'Estándar',
    descripcion: 'Teja de barro tradicional con excelente aislamiento térmico.',
    stock: 450,
    categoria: 'Tejas',
    imagen: 'https://tse2.mm.bing.net/th/id/OIP.AaIXjKGys99FaptD3xTg4AAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 10,
    nombre: 'Bloquelón',
    precio: 5500.00,
    medidas: 'Grande',
    descripcion: 'Bloquelón de gran tamaño para placas y entrepisos.',
    stock: 150,
    categoria: 'Bloques',
    imagen: 'https://media.falabella.com/sodimacCO/152339/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 11,
    nombre: 'Ladrillo Prensado Liviano 24.5x12x6cm Santafe',
    precio: 1400.00,
    medidas: '24.5x12x6 cm',
    descripcion: 'Ladrillo prensado liviano Santafe. 2.2 Kg, rendimiento 56 u/m2. Tipo enchape, color terracota. Código: 114940.',
    stock: 1000,
    categoria: 'Ladrillos',
    imagen: 'https://tse1.explicit.bing.net/th/id/OIP.tjvaRd5heYNx-pBY-hdIFwHaEx?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 12,
    nombre: 'Bloque Perf Vert DP 33x23x11.5cm',
    precio: 4900.00,
    medidas: '33x23x11.5 cm',
    descripcion: 'Bloque perforación vertical DP estructural. 7.9 Kg, rendimiento 12.25 u/m2. Color terracota. Código: 76786.',
    stock: 600,
    categoria: 'Bloques',
    imagen: 'https://tse1.explicit.bing.net/th/id/OIP.pNBz_1pKxsYPDFmnk9nQ_wHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 13,
    nombre: 'Ladrillo Refractario 24x12.5x4cm 1400°C',
    precio: 2700.00,
    medidas: '24x12.5x4 cm',
    descripcion: 'Ladrillo refractario de alta resistencia térmica hasta 1400°C. 1.5 Kg, rendimiento 36 u/m2, color arena. Código: 159253.',
    stock: 500,
    categoria: 'Refractarios',
    imagen: 'https://media.adeo.com/media/4405301/media.jpeg?width=3000&height=3000&format=jpg&quality=80&fit=bounds'
  },
  {
    id: 14,
    nombre: 'Tolete #1 Perforado 24x12x6cm',
    precio: 660.00,
    medidas: '24x12x6 cm',
    descripcion: 'Tolete #1 perforado artesanal. 2.10 Kg, rendimiento 56 u/m2. Garantía 1 año. Código: 99717.',
    stock: 1500,
    categoria: 'Ladrillos',
    imagen: 'https://imagedelivery.net/4fYuQyy-r8_rpBpcY7lH_A/sodimacCO/99717/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 15,
    nombre: 'Prensado Macizo 24.5x12x5.5cm',
    precio: 1900.00,
    medidas: '24.5x12x5.5 cm',
    descripcion: 'Ladrillo prensado macizo tipo enchape. Rendimiento 60 u/m2, color terracota. Código: 23209.',
    stock: 800,
    categoria: 'Ladrillos',
    imagen: 'https://media.falabella.com/sodimacCO/23209/w=1036,h=832,f=webp,fit=contain,q=85'
  },
  {
    id: 16,
    nombre: 'Tableta Arcilla Cúcuta 20x20cm',
    precio: 23000.00,
    medidas: '20x20 cm',
    descripcion: 'Tableta elaborada en arcilla natural tamaño 20x20 cm. Acabado tradicional cálido para pisos y muros.',
    stock: 400,
    categoria: 'Tabletas',
    imagen: 'https://moraventas.com/wp-content/uploads/2021/06/TABLON-30X30-GRAFILADO.jpeg'
  },
  {
    id: 17,
    nombre: 'Adoquín Corbatín 15x10x6cm',
    precio: 800.00,
    medidas: '15x10x6 cm',
    descripcion: 'Adoquín tipo corbatín para pavimentación exterior y senderos de alto tránsito.',
    stock: 1200,
    categoria: 'Adoquines',
    imagen: 'https://www.ladrilleragrespan.com/wp-content/uploads/2017/04/Ladrillo-Corbatin-LVH.jpg'
  },
  {
    id: 18,
    nombre: 'Tableta Rústica 25x25cm',
    precio: 20000.00,
    medidas: '25x25 cm',
    descripcion: 'Tableta acabado rústico en arcilla de alta resistencia, formato 25x25 cm.',
    stock: 350,
    categoria: 'Tabletas',
    imagen: 'https://tse1.explicit.bing.net/th/id/OIP.W_3kJaK5HjfKif7N2ne9LwHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 19,
    nombre: 'Ladrillo Prisma Gris 24x12x6cm',
    precio: 900.00,
    medidas: '24x12x6 cm',
    descripcion: 'Ladrillo de fachada acabado prisma gris moderno. Alta estética arquitectónica.',
    stock: 700,
    categoria: 'Fachadas',
    imagen: 'https://tse4.mm.bing.net/th/id/OIP.A8TqMwqbqzhjzgMz3wYQ6wHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 20,
    nombre: 'Ladrillo Cocoa 24x12x6cm',
    precio: 900.00,
    medidas: '24x12x6 cm',
    descripcion: 'Ladrillo de fachada tono cocoa oscuro elegante. Gran durabilidad y textura.',
    stock: 700,
    categoria: 'Fachadas',
    imagen: 'https://www.ladrilleramelendez.com.co/wp-content/uploads/2020/10/4212_Sin-Fondo.png'
  },
  {
    id: 21,
    nombre: 'Arena de Río (m³)',
    precio: 100000.00,
    medidas: 'm³',
    descripcion: 'Arena de río lavada y seleccionada para mezclas de concreto y pegas de mampostería.',
    stock: 100,
    categoria: 'Agregados',
    imagen: 'https://tse1.mm.bing.net/th/id/OIP.DQ4hFt5HdNu9HjDmsxbNKgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 22,
    nombre: 'Arena Amarilla (m³)',
    precio: 100000.00,
    medidas: 'm³',
    descripcion: 'Arena amarilla seleccionada para morteros de pega, acabados y revoques uniformes.',
    stock: 100,
    categoria: 'Agregados',
    imagen: 'https://tse1.mm.bing.net/th/id/OIP.Jqdc8X6tV7Bua7H7fsANggHaFj?r=0&w=800&h=600&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 23,
    nombre: 'Mixto de Concreto (m³)',
    precio: 100000.00,
    medidas: 'm³',
    descripcion: 'Material mixto granular (grava y arena) balanceado para fundición estructural.',
    stock: 100,
    categoria: 'Agregados',
    imagen: 'https://tse1.mm.bing.net/th/id/OIP.LuWELSza6RsI_Eo25QoSsAHaE8?r=0&w=800&h=534&rs=1&pid=ImgDetMain&o=7&rm=3'
  }
];

async function syncAll() {
  const conn = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3taWuA3YripVimE.root',
    password: '4LGZYjlakLtYXRGS',
    database: 'test',
    ssl: { rejectUnauthorized: false }
  });

  // 1. Delete duplicates with id > 23
  await conn.execute('DELETE FROM productos WHERE id > 23');

  // 2. Upsert each of the 23 products
  for (const p of all23Products) {
    await conn.execute(
      'INSERT INTO productos (id, nombre, precio, medidas, descripcion, stock, categoria, imagen) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE ' +
      '  nombre = VALUES(nombre), ' +
      '  precio = VALUES(precio), ' +
      '  medidas = VALUES(medidas), ' +
      '  descripcion = VALUES(descripcion), ' +
      '  stock = VALUES(stock), ' +
      '  categoria = VALUES(categoria), ' +
      '  imagen = VALUES(imagen)',
      [p.id, p.nombre, p.precio, p.medidas, p.descripcion, p.stock, p.categoria, p.imagen]
    );
  }

  const [rows] = await conn.execute('SELECT id, nombre, categoria, imagen FROM productos ORDER BY id ASC');
  console.log('Total productos en TiDB:', rows.length);
  rows.forEach(r => console.log(r.id, r.nombre, '-->', r.imagen));
  await conn.end();
}

syncAll().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
