const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('smartbuild_v3.sqlite');

const org1Id = '11111111-1111-1111-1111-111111111111'; // Ubbee

const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@ubbee.fr'").get();
if (!admin) {
    db.prepare(`INSERT INTO users (id, email, name, password, role, "organizationId", "createdAt") VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`)
        .run(crypto.randomUUID(), 'admin@ubbee.fr', 'Super Admin', 'password', 'SUPER_ADMIN', org1Id);
    console.log("Super Admin re-created manually!");
} else {
    db.prepare("UPDATE users SET password = 'password' WHERE email = 'admin@ubbee.fr'").run();
    console.log("Super Admin already exists, password updated.");
}

const users = db.prepare('SELECT email, role, "organizationId" FROM users').all();
console.table(users);
