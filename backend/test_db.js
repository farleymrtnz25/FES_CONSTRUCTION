require('dotenv').config();
const db = require('./database');

async function test() {
    try {
        const [rows] = await db.query("SELECT 1 as val");
        console.log("DB connection OK:", rows);
    } catch (e) {
        console.error("DB connection error:", e);
    }
    process.exit(0);
}
test();
