const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

const sites = db.prepare('SELECT id, name, address, city, latitude, longitude FROM site WHERE name LIKE ?').all('%Station%');
console.log('Sites found:', sites);
