const { Client } = require('ssh2');

const script = `
echo "=== UFW STATUS ==="
ufw status
echo "=== NETSTAT 1883 ==="
netstat -tlnp | grep 1883 || echo "No listener"
echo "=== MOSQUITTO STATUS ==="
systemctl is-active mosquitto || echo "Mosquitto not active"
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
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
    password: "5FPuD8)DpuHH8'Ic.(r#"
});
