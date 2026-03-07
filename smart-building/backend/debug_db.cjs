const fs = require('fs');
const db = require('better-sqlite3')('smartbuild_v3.sqlite');

const users = db.prepare('SELECT id, email, role, organizationId FROM users').all();
const orgs = db.prepare('SELECT id, name FROM organizations').all();

fs.writeFileSync('db_dump.txt', JSON.stringify({ users, orgs }, null, 2));
console.log("Dump written to db_dump.txt");
