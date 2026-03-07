const { Client } = require('ssh2');

const script = `
cd /opt/gravity-lab/smart-building/backend
echo "==== ENV VARS ===="
cat .env 2>/dev/null

echo "\\n==== SQLITE FILES FOUND ===="
find . -name "*.sqlite"

echo "\\n==== NESTJS TYPEORM CONFIG ===="
cat src/app.module.ts | grep -A 5 "TypeOrmModule.forRoot"
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => process.stdout.write(d))
            .stderr.on('data', (d) => process.stdout.write(d))
            .on('close', () => conn.end());
    });
}).connect({
    host: '76.13.59.115',
    port: 22,
    username: 'root',
    password: "5FPuD8)DpuHH8'Ic.(r#"
});
