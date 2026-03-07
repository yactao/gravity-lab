const Database = require('better-sqlite3');
const db = new Database('smartbuild_v3.sqlite');

const org1Id = '11111111-1111-1111-1111-111111111111'; // Ubbee
const org2Id = '22222222-2222-2222-2222-222222222222'; // CASA

// Generate random UUIDs for the missing users
const crypto = require('crypto');

// Check if manager exists
const manager = db.prepare('SELECT id FROM users WHERE email=?').get('manager@ubbee.fr');
if (!manager) {
    db.prepare(`INSERT INTO users (id, email, name, password, role, "organizationId", "createdAt") VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`)
        .run(crypto.randomUUID(), 'manager@ubbee.fr', 'Energy Manager', 'password', 'ENERGY_MANAGER', org1Id);
    console.log("Manager created.");
}

// Check if client casa exists
const casa = db.prepare('SELECT id FROM users WHERE email=?').get('client@casa.fr');
if (!casa) {
    db.prepare(`INSERT INTO users (id, email, name, password, role, "organizationId", "createdAt") VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`)
        .run(crypto.randomUUID(), 'client@casa.fr', 'Responsable Casa', 'password', 'CLIENT', org2Id);
    console.log("Casa Client created.");
}

const users = db.prepare('SELECT email, role, "organizationId" FROM users').all();
console.table(users);
