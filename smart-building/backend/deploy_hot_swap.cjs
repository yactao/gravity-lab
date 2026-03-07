const { Client } = require('ssh2');
const fs = require('fs');

const backendFile = './src/mqtt.service.ts';
const frontendFile = '../frontend/src/app/sites/[id]/page.tsx';

const backendContent = fs.readFileSync(backendFile, 'utf8');
const frontendContent = fs.readFileSync(frontendFile, 'utf8');

const conn = new Client();

console.log('🔄 Connexion au serveur de production...');

conn.on('ready', () => {
    console.log('✅ Connecté via SSH');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('📤 Upload des fichiers modifiés...');

        const bStream = sftp.createWriteStream('/opt/gravity-lab/smart-building/backend/src/mqtt.service.ts');
        bStream.write(backendContent);
        bStream.end();

        bStream.on('close', () => {
            console.log('✅ mqtt.service.ts (Backend) uploadé.');

            const fStream = sftp.createWriteStream('/opt/gravity-lab/smart-building/frontend/src/app/sites/[id]/page.tsx');
            fStream.write(frontendContent);
            fStream.end();

            fStream.on('close', () => {
                console.log('✅ page.tsx (Frontend Site) uploadé.');

                console.log('🔨 Lancement de la compilation croisée et du redémarrage sans interruption (PM2)...');

                const script = `
                export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node | tail -n 1)/bin
                [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

                echo "[BACKEND] Recompilation..."
                cd /opt/gravity-lab/smart-building/backend
                npm run build
                echo "[BACKEND] Redémarrage..."
                pm2 reload gtb-backend

                echo "[FRONTEND] Recompilation..."
                cd /opt/gravity-lab/smart-building/frontend
                npm run build
                echo "[FRONTEND] Redémarrage..."
                pm2 reload gtb-frontend
                
                echo "🎉 Déploiement Hot-Swap terminé !"
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
            });
        });
    });
}).connect({
    host: '76.13.59.115',
    port: 22,
    username: 'root',
    password: "5FPuD8)DpuHH8'Ic.(r#"
});
