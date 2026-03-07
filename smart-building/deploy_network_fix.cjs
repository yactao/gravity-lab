const { Client } = require('ssh2');
const fs = require('fs');

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

        writeSftp('/opt/gravity-lab/smart-building/frontend/src/app/network/page.tsx', frontendContent, () => {
            console.log('✅ Frontend network code uploaded');
            console.log('🚀 Rebuilding Frontend on VPS...');
            const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/frontend
npm run build && pm2 restart gtb-frontend
      `;
            conn.exec(script, (err, stream) => {
                if (err) throw err;
                stream.on('data', d => process.stdout.write(d))
                    .stderr.on('data', d => process.stderr.write(d))
                    .on('close', () => {
                        console.log('✅ Fix deployed successfully');
                        conn.end();
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
