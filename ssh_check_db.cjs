const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== VERIFICATION DB SQLITE ===="
cd /opt/gravity-lab/smart-building/backend
node -e "
const db = require('better-sqlite3')('smartbuild_v3.sqlite');
console.log('--- ORGANIZATIONS ---');
const orgs = db.prepare('SELECT id, name FROM organizations').all();
console.table(orgs);

console.log('--- SITES ---');
const sites = db.prepare('SELECT id, name, organizationId FROM site').all();
console.table(sites);

console.log('--- USERS ---');
const users = db.prepare('SELECT id, email, organizationId FROM user').all();
console.table(users);
"
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_24.txt', output);
            console.log('Output saved to vps_output_24.txt');
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
