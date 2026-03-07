const { Client } = require('ssh2');

const conn = new Client();

console.log('🔄 Build du frontend en mode verbeux (sans PM2 pour inspecter les erreurs)');

conn.on('ready', () => {
    const script = `
        export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node | tail -n 1)/bin
        [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
        
        cd /opt/gravity-lab/smart-building/frontend
        pm2 stop gtb-frontend
        rm -rf .next
        echo "[BUILD] Lancement de la compilation Next.js..."
        npm run build
        echo "[BUILD] Fin du script. Code retour: $?"
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
