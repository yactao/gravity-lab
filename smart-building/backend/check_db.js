const Database = require('better-sqlite3');
const db = new Database('smartbuild_v3.sqlite');

try {
    const statement = db.prepare('SELECT * FROM gateway WHERE serialNumber LIKE ?');
    const result = statement.all('%2c:cf:67:1e:30:ed%');

    if (result.length > 0) {
        console.log("✅ U-Bot FOUND in database!");
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log("❌ U-Bot NOT FOUND. Looking at all gateways...");
        const all = db.prepare('SELECT id, name, serialNumber, status FROM gateway').all();
        console.log(JSON.stringify(all, null, 2));
    }
} catch (err) {
    console.error("Error accessing table:", err.message);

    // Maybe the column name is different
    console.log("Let's check table schema:");
    const columns = db.prepare("PRAGMA table_info(gateway)").all();
    console.log(columns);
} finally {
    db.close();
}
