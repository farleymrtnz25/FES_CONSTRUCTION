const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    console.log('🚀 Iniciando actualización de esquema de base de datos...');

    let conn;
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'fes_construccion'
        };

        conn = await mysql.createConnection(config);
        console.log('✅ Conexión exitosa');

        // Agregar columna tipo_persona a la tabla pedidos si no existe
        const [columns] = await conn.execute('SHOW COLUMNS FROM pedidos LIKE "tipo_persona"');

        if (columns.length === 0) {
            console.log('Agregando columna "tipo_persona" a la tabla pedidos...');
            await conn.execute("ALTER TABLE pedidos ADD COLUMN tipo_persona ENUM('Natural', 'Jurídica') DEFAULT 'Natural' AFTER usuario_id");
            console.log('✅ Columna "tipo_persona" agregada correctamente');
        } else {
            console.log('ℹ️  La columna "tipo_persona" ya existe en la tabla pedidos');
        }

        console.log('\n🎉 Actualización completada con éxito');
    } catch (err) {
        console.error('❌ Error en el proceso de actualización:', err);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

updateSchema();
