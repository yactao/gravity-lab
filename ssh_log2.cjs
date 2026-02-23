const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building
git fetch --all
git reset --hard origin/main

echo "==== STARTING PM2 ===="
pm2 startOrRestart ecosystem.config.cjs --env production
pm2 save

echo "==== STATUS =================="
pm2 status

echo "==== LOGS BACKEND ============"
pm2 logs gtb-backend --lines 20 --nostream

echo "==== REQUEST LOCAL API ======="
sleep 2 # wait for backend to boot completely
curl -s -v http://127.0.0.1:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"manager@ubbee.fr","password":"password"}'
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_9.txt', output);
            console.log('Output saved to vps_output_9.txt');
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
