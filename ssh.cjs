const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== PM2 BACKEND LOGS ===="
pm2 logs gtb-backend --lines 50 --nostream

echo "\\n==== DB USERS ===="
cd /opt/gravity-lab/smart-building/backend
node -e "
const db = require('better-sqlite3')('./smartbuild_v3.sqlite');
const rows = db.prepare('SELECT email, password, role FROM users WHERE email IN (\\'admin@ubbee.fr\\', \\'manager@ubbee.fr\\', \\'client@ubbee.fr\\')').all();
console.table(rows);
"
`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code, signal) => {
      fs.writeFileSync('vps_output.txt', output);
      console.log('Output saved to vps_output.txt');
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
