const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > query_mac.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  const gateways = db.prepare("SELECT id, name, serialNumber, status FROM gateway").all();
  console.log("=== LISTE DES GATEWAYS EN PROD ===");
  console.log(JSON.stringify(gateways, null, 2));
} catch(e) {
  console.error("❌ ERROR querying =>", e.message);
}

db.close();
EOF

node query_mac.js
rm query_mac.js
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
