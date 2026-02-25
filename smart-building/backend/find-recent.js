const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

const sites = db.prepare('SELECT id, name as site_name, address, city, latitude, longitude FROM site ORDER BY createdAt DESC LIMIT 10').all();
console.log('Sites found:', sites);

const orgs = db.prepare('SELECT id, name as org_name FROM organizations ORDER BY createdAt DESC LIMIT 10').all();
console.log('Orgs found:', orgs);
