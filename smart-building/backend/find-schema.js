const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

const sites = db.prepare('SELECT id, name, address, latitude, longitude FROM site LIMIT 20').all();
console.log('Sites:', sites);
