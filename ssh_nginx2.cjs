const { Client } = require('ssh2');
const fs = require('fs');

const script = `
echo "==== PROCESSUS SUR LE PORT 80 ===="
lsof -i :80 || netstat -tlnp | grep ':80 '
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_17.txt', output);
            console.log('Output saved to vps_output_17.txt');
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
