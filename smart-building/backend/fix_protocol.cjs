const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > fix_protocol.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  // Update Gateway to set protocol
  const info = db.prepare("UPDATE gateway SET protocol = 'MQTT' WHERE serialNumber IN ('2c:cf:67:1e:30:ec', '2ccf671e30ec')").run();
  
  console.log("=== UPDATE RESULT ===");
  if (info.changes > 0) {
      console.log(\`✅ Protocole défini sur 'MQTT' pour le U-Bot (\${info.changes} ligne(s) modifiée(s)).\`);
  } else {
      console.log("⚠️ Le U-Bot n'a pas été trouvé pour être mis à jour.");
  }
} catch(e) {
  console.error("❌ ERROR updating =>", e.message);
}

db.close();
EOF

node fix_protocol.js
rm fix_protocol.js
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
