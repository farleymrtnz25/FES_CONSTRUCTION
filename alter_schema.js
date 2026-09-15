const db = require('./backend/database');

async function alterSchema() {
    try {
        console.log("Adding columns to pedidos...");
        await db.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0");
        await db.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS iva DECIMAL(10,2) DEFAULT 0");
        await db.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ica DECIMAL(10,2) DEFAULT 0");

        console.log("Adding columns to detalle_pedido...");
        await db.query("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS nombre_producto VARCHAR(255)");
        await db.query("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0");

        console.log("Adding columns to movimientos_inventario...");
        await db.query("ALTER TABLE movimientos_inventario ADD COLUMN IF NOT EXISTS nombre_producto VARCHAR(255)");

        console.log("Migration complete!");
    } catch (e) {
        console.error("Migration error:", e);
    }
    process.exit(0);
}
alterSchema();
