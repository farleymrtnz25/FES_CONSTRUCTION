const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function setup() {
  console.log('🚀 Iniciando setup de base de datos...');

  let conn;
  try {
    console.log('Intentando conectar al servidor MySQL...');
    const config = process.env.DATABASE_URL
      ? {
          uri: process.env.DATABASE_URL,
          ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
        };
    console.log('Configuración:', { ...config, password: '***' });

    conn = await mysql.createConnection(config);
    console.log('✅ Conexión al servidor exitosa');

    const dbName = process.env.DB_NAME || 'fes_construccion';
    try {
      await conn.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
      console.log(`✅ Base de datos "${dbName}" asegurada`);
      await conn.changeUser({ database: dbName });
    } catch (e) {
      console.log(`ℹ️ Nota sobre base de datos: ${e.message} (usando base de datos por defecto)`);
    }
    console.log(`✅ Cambiado a base de datos "${dbName}"`);

    // Tabla: productos
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                precio DECIMAL(12,2) NOT NULL,
                medidas VARCHAR(50),
                descripcion TEXT,
                stock INT DEFAULT 0,
                imagen TEXT,
                categoria VARCHAR(50) DEFAULT 'General',
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    console.log('✅ Tabla productos OK');

    // Seed productos
    const [pRows] = await conn.execute('SELECT COUNT(*) AS total FROM productos');
    if (pRows[0].total === 0) {
      const seed = [
        ['Ladrillo pequeño negro', 300, '18*9*6', 'Ladrillo artesanal de alta calidad.', 1000, 'https://placehold.co/300x200/2d1b69/ffffff?text=Ladrillo+Negro', 'Ladrillos'],
        ['Ladrillo pequeño rosado', 260, '18*9*6', 'Ladrillo artesanal rosado excelente.', 1200, 'https://placehold.co/300x200/f87171/ffffff?text=Ladrillo+Rosado', 'Ladrillos'],
        ['Ladrillo grande negro', 450, '22*12*7', 'Ladrillo grande negro superior.', 800, 'https://placehold.co/300x200/1f2937/ffffff?text=Ladrillo+Grande+Negro', 'Ladrillos'],
        ['Ladrillo grande rosado', 400, '22*12*7', 'Ladrillo grande rosado artesanal.', 900, 'https://placehold.co/300x200/fda4af/ffffff?text=Ladrillo+Grande+Rosado', 'Ladrillos'],
        ['Bloque número 4', 950, 'Estándar', 'Bloque de alta resistencia.', 500, 'https://placehold.co/300x200/94a3b8/ffffff?text=Bloque+4', 'Bloques'],
        ['Bloque número 5', 1000, 'Estándar', 'Bloque de máxima resistencia.', 400, 'https://placehold.co/300x200/64748b/ffffff?text=Bloque+5', 'Bloques'],
        ['Regilla', 600, 'Estándar', 'Regilla de arcilla ventilación.', 300, 'https://placehold.co/300x200/86efac/ffffff?text=Regilla', 'Especiales'],
        ['Adoquín', 550, 'Estándar', 'Adoquín de arcilla pavimento.', 600, 'https://placehold.co/300x200/a3a3a3/ffffff?text=Adoquin', 'Especiales'],
        ['Teja de barro', 1000, 'Estándar', 'Teja de barro tradicional.', 450, 'https://placehold.co/300x200/dc2626/ffffff?text=Teja+de+Barro', 'Tejas'],
        ['Bloquelón', 4000, 'Grande', 'Bloquelón de gran tamaño.', 150, 'https://placehold.co/300x200/7c3aed/ffffff?text=Bloquelon', 'Bloques'],
      ];
      for (const p of seed) {
        await conn.execute(
          'INSERT INTO productos (nombre, precio, medidas, descripcion, stock, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
          p
        );
      }
      console.log('✅ 10 Productos iniciales sembrados');
    }

    // Tabla: usuarios
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol ENUM('cliente','admin') DEFAULT 'cliente',
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    console.log('✅ Tabla usuarios OK');

    // Tabla: pedidos
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT,
                tipo_persona ENUM('Natural', 'Jurídica') DEFAULT 'Natural',
                subtotal DECIMAL(12,2) NOT NULL,
                iva DECIMAL(12,2) NOT NULL,
                ica DECIMAL(12,2) NOT NULL,
                total DECIMAL(12,2) NOT NULL,
                estado ENUM('Pendiente','Pagado','En Proceso','Enviado','Entregado','Finalizado','Cancelado') DEFAULT 'Pendiente',
                metodo_pago VARCHAR(50) DEFAULT 'WhatsApp',
                notas TEXT,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
            )
        `);
    console.log('✅ Tabla pedidos OK');

    // Tabla: detalle_pedido
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS detalle_pedido (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pedido_id INT NOT NULL,
                producto_id INT NOT NULL,
                nombre_producto VARCHAR(150) NOT NULL,
                precio_unitario DECIMAL(12,2) NOT NULL,
                cantidad INT NOT NULL,
                subtotal DECIMAL(12,2) NOT NULL,
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
            )
        `);
    console.log('✅ Tabla detalle_pedido OK');

    // Tabla: movimientos_inventario
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS movimientos_inventario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                nombre_producto VARCHAR(150) NOT NULL,
                tipo ENUM('entrada','salida') NOT NULL,
                cantidad INT NOT NULL,
                nota TEXT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    console.log('✅ Tabla movimientos_inventario OK');

    // Admin por defecto
    const [existing] = await conn.execute(`SELECT id FROM usuarios WHERE email = 'admin@fes.com'`);
    if (existing.length === 0) {
      const hash = await bcrypt.hash('Admin1234!', 12);
      await conn.execute(
        `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
        ['Administrador FES', 'admin@fes.com', hash, 'admin']
      );
      console.log('✅ Usuario admin creado: admin@fes.com / Admin1234!');
    } else {
      console.log('ℹ️  Admin ya existe, actualizando su contraseña por si acaso...');
      const hash = await bcrypt.hash('Admin1234!', 12);
      await conn.execute(`UPDATE usuarios SET password = ? WHERE email = 'admin@fes.com'`, [hash]);
      console.log('✅ Contraseña de admin actualizada');
    }

    console.log('\n🎉 Base de datos configurada correctamente');
  } catch (err) {
    console.error('❌ Error en el proceso de setup:', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

setup();
