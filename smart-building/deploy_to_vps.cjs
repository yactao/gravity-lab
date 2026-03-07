const { Client } = require('ssh2');
const fs = require('fs');

const backendContent = fs.readFileSync('./backend/src/app.service.ts', 'utf8');
const frontendContent = fs.readFileSync('./frontend/src/app/network/page.tsx', 'utf8');

const conn = new Client();
conn.on('ready', () => {
    console.log('✅ SSH Connection established');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const writeSftp = (path, content, cb) => {
            const stream = sftp.createWriteStream(path);
            stream.write(content);
            stream.end();
            stream.on('close', cb);
        };

        writeSftp('/opt/gravity-lab/smart-building/backend/src/app.service.ts', backendContent, () => {
            console.log('✅ Backend code uploaded');
            writeSftp('/opt/gravity-lab/smart-building/frontend/src/app/network/page.tsx', frontendContent, () => {
                console.log('✅ Frontend code uploaded');

                console.log('🚀 Starting remote build and restart via PM2...');
                const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "Rebuilding Backend..."
cd /opt/gravity-lab/smart-building/backend
npm run build

echo "Rebuilding Frontend..."
cd /opt/gravity-lab/smart-building/frontend
npm run build

echo "Restarting PM2..."
pm2 restart gtb-backend gtb-frontend
        `;
                conn.exec(script, (err, stream) => {
                    if (err) throw err;
                    stream.on('data', d => process.stdout.write(d))
                        .stderr.on('data', d => process.stderr.write(d))
                        .on('close', () => {
                            console.log('✅ Remote deployment complete');
                            conn.end();
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
