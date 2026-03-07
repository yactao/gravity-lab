const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > assign_projet_y_final.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  // Update Gateway to link it to Batiment Y First Test
  const info = db.prepare("UPDATE gateway SET siteId = 'b3861b0c-8ffb-4456-83c3-1dd0fc5540f5' WHERE serialNumber IN ('2c:cf:67:1e:30:ec', '2ccf671e30ec')").run();
  
  console.log("=== LINKING RESULT ===");
  if (info.changes > 0) {
      console.log(\`✅ U-Bot lié avec succès au site 'Batiment Y First Test' (\${info.changes} ligne(s) modifiée(s)).\`);
  } else {
      console.log("⚠️ Le U-Bot n'a pas été trouvé pour être mis à jour.");
  }
} catch(e) {
  console.error("❌ ERROR assigning =>", e.message);
}

db.close();
EOF

node assign_projet_y_final.js
rm assign_projet_y_final.js
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
