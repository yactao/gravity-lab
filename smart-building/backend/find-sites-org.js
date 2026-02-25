const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

const sites = db.prepare(`
    SELECT s.id, s.name as site_name, s.address, s.city, s.latitude, s.longitude, o.name as org_name
    FROM site s
    JOIN organization o ON s.organizationId = o.id
    WHERE o.name LIKE '%Station%' OR s.name LIKE '%Station%'
`).all();
console.log('Sites found:', sites);
