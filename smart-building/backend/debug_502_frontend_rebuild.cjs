const { Client } = require('ssh2');

const conn = new Client();

console.log('🔄 Tentative de réparation complète du Frontend Next.js sur VPS...');

conn.on('ready', () => {
    const script = `
        export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node | tail -n 1)/bin
        [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

        echo "[PM2] Arrêt du processus frontend pour libérer les fichiers..."
        pm2 stop gtb-frontend
        
        echo "[CLEAR] Purge agressive du dossier .next..."
        cd /opt/gravity-lab/smart-building/frontend
        rm -rf .next
        
        echo "[BUILD] Recompilation de Next.js (peut prendre >1 min)..."
        npm run build
        
        echo "[PM2] Redémarrage du processus frontend..."
        pm2 restart gtb-frontend
        
        echo "[PM2] Nouveaux logs :"
        pm2 logs gtb-frontend --nostream --lines 20
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
