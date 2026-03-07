const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > insert_mac.js
const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./smartbuild_v3.sqlite');

const newId = crypto.randomUUID();
const serialNumber = '2c:cf:67:1e:30:ed';

try {
  // Check if already exists
  const existing = db.prepare("SELECT * FROM gateway WHERE serialNumber = ?").get(serialNumber);
  
  if (existing) {
     console.log("✅ Gateway existe déjà:", existing);
  } else {
     const stmt = db.prepare(\`
       INSERT INTO gateway (id, name, serialNumber, status, siteId) 
       VALUES (?, ?, ?, ?, ?)
     \`);
     
     // Note: We don't assign a site manually right now, so it will wait for assignment or be NULL.
     // In the schema, siteId is foreign key or just string.
     stmt.run(newId, "U-Bot Test - Taoufik", serialNumber, "offline", null);
     
     console.log("🚀 INSERT SUCCESSFUL!");
     const verify = db.prepare("SELECT * FROM gateway WHERE id = ?").get(newId);
     console.log(verify);
  }
} catch(e) {
  console.error("❌ ERROR inserting =>", e.message);
}

db.close();
EOF

node insert_mac.js
rm insert_mac.js
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            output += data;
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            output += data;
            process.stderr.write(data);
        });
    });
}).connect({
    host: '76.13.59.115',
    port: 22,
    username: 'root',
    password: "5FPuD8)DpuHH8'Ic.(r#"
});
