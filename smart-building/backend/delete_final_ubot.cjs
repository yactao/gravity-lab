const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > delete_mac_final.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  // We search for both formats just to be absolutely sure
  const gateways = db.prepare("SELECT id FROM gateway WHERE serialNumber IN ('2ccf671e30ed', '2c:cf:67:1e:30:ed')").all();
  
  if (gateways.length > 0) {
    db.pragma('foreign_keys = OFF');
    
    for (const gw of gateways) {
      db.prepare("DELETE FROM reading WHERE sensorId IN (SELECT id FROM sensor WHERE gatewayId = ?)").run(gw.id);
      try { db.prepare("DELETE FROM alert WHERE sensorId IN (SELECT id FROM sensor WHERE gatewayId = ?)").run(gw.id); } catch(e){}
      db.prepare("DELETE FROM sensor WHERE gatewayId = ?").run(gw.id);
      db.prepare("DELETE FROM gateway WHERE id = ?").run(gw.id);
      console.log(\`✅ Gateway \${gw.id} removed.\`);
    }
    
    db.pragma('foreign_keys = ON');
    console.log("=== DELETE RESULT ===");
    console.log("✅ Toutes les traces de l'ancien U-Bot Test ont été purgées.");
  } else {
    console.log("⚠️ Aucune gateway trouvée avec ces identifiants.");
  }
} catch(e) {
  console.error("❌ ERROR deleting =>", e.message);
}

db.close();
EOF

node delete_mac_final.js
rm delete_mac_final.js
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
