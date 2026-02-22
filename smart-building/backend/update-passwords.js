const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
    const res1 = db.prepare(`UPDATE users SET password = 'password' WHERE email IN ('manager@ubbee.fr', 'client@casa.fr')`).run();
    const res2 = db.prepare(`UPDATE users SET password = 'admin' WHERE email = 'admin@ubbee.fr'`).run();
    console.log(`Updated users. result1: ${res1.changes}, result2: ${res2.changes}`);
} catch (e) {
    console.error(e);
} finally {
    db.close();
}
