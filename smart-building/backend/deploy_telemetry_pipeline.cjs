const { Client } = require('ssh2');
const fs = require('fs');

const backendMqttFile = '../backend/src/mqtt.service.ts';
const backendAppFile = '../backend/src/app.service.ts';
const frontendPageFile = '../frontend/src/app/sites/[id]/page.tsx';

const mqttContent = fs.readFileSync(backendMqttFile, 'utf8');
const appContent = fs.readFileSync(backendAppFile, 'utf8');
const pageContent = fs.readFileSync(frontendPageFile, 'utf8');

const conn = new Client();

console.log('🔄 Connexion au serveur de production pour le Full Data Pipeline...');

conn.on('ready', () => {
    console.log('✅ Connecté via SSH');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('📤 Upload des fichiers modifiés...');

        let uploads = 0;
        const checkDone = () => {
            uploads++;
            if (uploads === 3) {
                console.log('✅ Tous les fichiers sont uploadés.');

                console.log('🔨 Lancement du Build et Restart...');
                const script = `
                export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node | tail -n 1)/bin
                [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

                echo "[BACKEND] Recompilation et redémarrage..."
                cd /opt/gravity-lab/smart-building/backend
                npm run build
                pm2 restart gtb-backend

                echo "[FRONTEND] Build complet et redémarrage..."
                cd /opt/gravity-lab/smart-building/frontend
                pm2 stop gtb-frontend
                rm -rf .next
                npm run build
                pm2 restart gtb-frontend
                
                echo "🎉 Pipeline Télémétrie déployée en Production !"
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
            }
        };

        const w1 = sftp.createWriteStream('/opt/gravity-lab/smart-building/backend/src/mqtt.service.ts');
        w1.write(mqttContent); w1.end(); w1.on('close', checkDone);

        const w2 = sftp.createWriteStream('/opt/gravity-lab/smart-building/backend/src/app.service.ts');
        w2.write(appContent); w2.end(); w2.on('close', checkDone);

        const w3 = sftp.createWriteStream('/opt/gravity-lab/smart-building/frontend/src/app/sites/[id]/page.tsx');
        w3.write(pageContent); w3.end(); w3.on('close', checkDone);
    });
}).connect({
    host: '76.13.59.115',
    port: 22,
    username: 'root',
    password: "5FPuD8)DpuHH8'Ic.(r#"
});
