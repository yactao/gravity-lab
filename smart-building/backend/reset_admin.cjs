const Database = require('better-sqlite3');
const db = new Database('smartbuild_v3.sqlite');
db.prepare("UPDATE users SET password = 'password' WHERE email = 'admin@ubbee.fr'").run();
console.log("Admin password updated to 'password'");
