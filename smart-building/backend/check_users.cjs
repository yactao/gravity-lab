const Database = require('better-sqlite3');
const db = new Database('smartbuild_v3.sqlite');
const users = db.prepare('SELECT email, password, role FROM users').all();
console.table(users);
