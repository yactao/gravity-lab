const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== PM2 LOGS (15 DERNIERES LIGNES) ===="
pm2 logs gtb-backend --lines 15 --nostream

echo "\\n==== TEST DIRECT DE L'API /api/sites EN LOCAL ===="
# 1. Login to get token
RESPONSE=$(curl -s -X POST http://127.0.0.1:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"manager@ubbee.fr","password":"password"}')
TOKEN=$(echo $RESPONSE | grep -oP '"access_token":"\\K[^"]+')
ORG_ID=$(echo $RESPONSE | grep -oP '"organizationId":"\\K[^"]+')

echo "Token récupéré : \${TOKEN:0:10}..."

# 2. Fetch sites
curl -s -v -X GET http://127.0.0.1:3001/api/sites \\
     -H "Authorization: Bearer $TOKEN" \\
     -H "x-organization-id: $ORG_ID" \\
     -H "x-user-role: ENERGY_MANAGER"
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_23.txt', output);
            console.log('Output saved to vps_output_23.txt');
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
    password: '5FPuD8)DpuHH8\'Ic.(r#'
});
