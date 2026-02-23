const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== RESET DE LA BASE SQLITE ===="
cd /opt/gravity-lab/smart-building/backend
pm2 stop gtb-backend
rm -f smartbuild_v3.sqlite

echo "Base supprimée. Redémarrage de PM2..."
pm2 start gtb-backend

echo "Attente de 5 secondes pour le seeding..."
sleep 5

pm2 logs gtb-backend --lines 20 --nostream
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_29.txt', output);
            console.log('Output saved to vps_output_29.txt');
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
