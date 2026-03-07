const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== PM2 STATUS ===="
pm2 status

echo "\\n==== PM2 LOGS (BACKEND) ===="
pm2 logs gtb-backend --lines 30 --nostream

echo "\\n==== PM2 LOGS (FRONTEND) ===="
pm2 logs gtb-frontend --lines 30 --nostream
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
