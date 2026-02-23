const { Client } = require('ssh2');
const fs = require('fs');

const script = `
echo "==== UFW STATUS ===="
ufw status

echo "\\n==== NGINX CONFIG ===="
cat /etc/nginx/sites-available/gtb || cat /etc/nginx/sites-enabled/default

echo "\\n==== PM2 ENV FRONTEND ===="
cat /opt/gravity-lab/smart-building/ecosystem.config.cjs
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_19.txt', output);
            console.log('Output saved to vps_output_19.txt');
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
