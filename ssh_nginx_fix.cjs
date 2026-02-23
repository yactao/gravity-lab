const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== CONFIGURATION DE NGINX ===="
cat > /etc/nginx/sites-available/smartbuilding << 'EOF'
server {
    listen 80;
    server_name _;

    # Backend API requests
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Next.js requests
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Active le site et supprime default s'il existe
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/smartbuilding /etc/nginx/sites-enabled/smartbuilding

# Vérifie et recharge Nginx
nginx -t && systemctl reload nginx

echo "\\n==== MISE A JOUR DU FRONTEND ===="
cd /opt/gravity-lab/smart-building/frontend
# Configure l'URL API publique pour pointer vers le port 80 (par défaut)
echo "NEXT_PUBLIC_API_URL=http://76.13.59.115" > .env.production

# Recompile le frontend avec la nouvelle URL
npm run build

echo "\\n==== REDEMARRAGE DE PM2 ===="
pm2 restart gtb-frontend
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_20.txt', output);
            console.log('Output saved to vps_output_20.txt');
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
