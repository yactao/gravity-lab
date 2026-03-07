const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const script = `
        export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node | tail -n 1)/bin
        [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

        echo "Stopping frontend process..."
        pm2 stop gtb-frontend
        
        cd /opt/gravity-lab/smart-building/frontend
        echo "Cleaning .next cache..."
        rm -rf .next

        echo "Building Next.js application..."
        npm run build
        
        echo "Restarting PM2..."
        pm2 restart gtb-frontend
    `;
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            process.exit(code);
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
