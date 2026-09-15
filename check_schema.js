const db = require('./backend/database');

async function checkSchema() {
    try {
        const [pedidos] = await db.query("DESCRIBE pedidos");
        console.log("pedidos table:", pedidos.map(p => p.Field));

        try {
            const [detalle] = await db.query("DESCRIBE detalle_pedido");
            console.log("detalle_pedido table:", detalle.map(p => p.Field));
        } catch (e) {
            console.log("detalle_pedido not found:", e.message);
        }

        try {
            const [movimientos] = await db.query("DESCRIBE movimientos_inventario");
            console.log("movimientos_inventario table:", movimientos.map(p => p.Field));
        } catch (e) {
            console.log("movimientos_inventario not found:", e.message);
        }

    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
checkSchema();
