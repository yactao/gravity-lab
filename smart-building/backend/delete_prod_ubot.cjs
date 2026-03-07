const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > delete_mac_force.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  const gw = db.prepare("SELECT id FROM gateway WHERE serialNumber = '2c:cf:67:1e:30:ed'").get();
  if (gw) {
    // Disable foreign keys temporarily to bypass constraint checks
    db.pragma('foreign_keys = OFF');
    db.prepare("DELETE FROM reading WHERE sensorId IN (SELECT id FROM sensor WHERE gatewayId = ?)").run(gw.id);
    try { db.prepare("DELETE FROM alert WHERE sensorId IN (SELECT id FROM sensor WHERE gatewayId = ?)").run(gw.id); } catch(e){}
    db.prepare("DELETE FROM sensor WHERE gatewayId = ?").run(gw.id);
    
    const info = db.prepare("DELETE FROM gateway WHERE id = ?").run(gw.id);
    db.pragma('foreign_keys = ON');
    
    console.log("=== DELETE RESULT ===");
    console.log("✅ Le U-Bot de test a été complètement supprimé en forçage (y compris les capteurs et l'historique de télemetrie).");
  } else {
    console.log("⚠️ Le U-Bot n'a pas été trouvé. Déjà supprimé ?");
  }
} catch(e) {
  console.error("❌ ERROR deleting =>", e.message);
}

db.close();
EOF

node delete_mac_force.js
rm delete_mac_force.js
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
