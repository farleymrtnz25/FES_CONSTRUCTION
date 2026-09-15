// test-db.js
console.log('🔍 Iniciando prueba de conexión a la base de datos...');

const db = require('./database');

async function testConnection() {
  try {
    console.log('📡 Intentando conectar con MySQL...');
    
    // Prueba básica de conexión
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    console.log('✅ Conexión exitosa a MySQL. Resultado de prueba:', rows[0].result);
    
    // Verificar si la tabla "productos" existe y tiene datos
    console.log('📦 Consultando productos...');
    const [productos] = await db.execute('SELECT id, nombre, precio FROM productos LIMIT 5');
    
    if (productos.length === 0) {
      console.warn('⚠️ La tabla "productos" está vacía.');
    } else {
      console.log(`✅ Se encontraron ${productos.length} productos:`);
      productos.forEach(p => console.log(`   - ${p.nombre} ($${p.precio})`));
    }
    
    console.log('🎉 ¡Prueba completada con éxito!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba de conexión:');
    console.error('   Mensaje:', error.message);
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
    console.error('💡 Verifica:');
    console.error('   - Que MySQL esté corriendo en XAMPP');
    console.error('   - Que el archivo .env tenga las credenciales correctas');
    console.error('   - Que la base de datos "fes_construccion" exista');
    console.error('   - Que la tabla "productos" esté creada');
  }
}

testConnection().then(() => process.exit(0));