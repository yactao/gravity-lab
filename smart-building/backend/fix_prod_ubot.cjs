const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > fix_mac_colons.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  // Restore gateway MAC address WITH colons
  const stmt = db.prepare("UPDATE gateway SET serialNumber = '2c:cf:67:1e:30:ed' WHERE id = '321187d1-0090-4961-8325-abe57f2c4889'");
  const info = stmt.run();
  console.log("=== UPDATE RESULT ===");
  console.log("Rows modified:", info.changes);
  
  if (info.changes > 0) {
      console.log("✅ L'adresse MAC a bien été RESTAURÉE avec les deux-points.");
  } else {
      console.log("⚠️ Aucune modification. Vérifiez l'ID.");
  }
} catch(e) {
  console.error("❌ ERROR updating =>", e.message);
}

db.close();
EOF

node fix_mac_colons.js
rm fix_mac_colons.js
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
