const { Client } = require('ssh2');

const conn = new Client();

console.log('🔄 Logs serveur...');

conn.on('ready', () => {
    const script = `
        export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node | tail -n 1)/bin
        [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

        echo "--- PM2 STATUS ---"
        pm2 status
        
        echo "--- PM2 LOGS BACKEND ---"
        pm2 logs gtb-backend --nostream --lines 100
    `;

    conn.exec(script, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).connect({
    host: '76.13.59.115',
    port: 22,
    username: 'root',
    password: "5FPuD8)DpuHH8'Ic.(r#"
});
