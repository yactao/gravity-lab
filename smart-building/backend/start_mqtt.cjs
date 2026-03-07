const { Client } = require('ssh2');

const script = `
echo "=== INSTALLATION MOSQUITTO ==="
apt-get update && apt-get install -y mosquitto mosquitto-clients

echo "=== CONFIGURATION MOSQUITTO ==="
mkdir -p /etc/mosquitto/conf.d/
cat << 'EOF' > /etc/mosquitto/conf.d/default.conf
listener 1883 0.0.0.0
allow_anonymous true
EOF

echo "=== STARTING MOSQUITTO ==="
systemctl enable mosquitto
systemctl restart mosquitto
systemctl status mosquitto --no-pager | grep Active

echo "=== CONFIGURING FIREWALL ==="
ufw allow 1883/tcp
ufw reload

echo "=== VERIFYING PORT 1883 ==="
netstat -tlnp | grep 1883 || echo "WARN: Port 1883 is still not listening"
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
