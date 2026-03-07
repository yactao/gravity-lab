const { Client } = require('ssh2');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /opt/gravity-lab/smart-building/backend

cat << 'EOF' > assign_gateway.js
const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

try {
  // 1. Trouver le site "Projet Y"
  const site = db.prepare("SELECT id, name FROM site WHERE name LIKE '%Projet Y%' OR name LIKE '%Batiment Y%'").get();
  
  if (!site) {
    console.log("❌ ERREUR: Site 'Projet Y' non trouvé ! Voici les sites disponibles :");
    const allSites = db.prepare("SELECT id, name FROM site").all();
    console.table(allSites);
  } else {
    console.log("✅ Site trouvé :", site.name, "(", site.id, ")");
    
    // 2. Mettre à jour la Gateway
    const mac = '%2c:cf:67:1e:30:ed%';
    const update = db.prepare("UPDATE gateway SET siteId = ? WHERE serialNumber LIKE ?").run(site.id, mac);
    
    if (update.changes > 0) {
      console.log("✅ SUCCESS: U-Bot assigné au site", site.name);
      
      // 3. Vérifier le résultat
      const gateway = db.prepare("SELECT name, serialNumber, siteId FROM gateway WHERE serialNumber LIKE ?").get(mac);
      console.log("Vérification :", gateway);
    } else {
      console.log("❌ ERREUR: Le U-Bot n'a pas pu être mis à jour.");
    }
  }
} catch(e) {
  console.error("❌ ERROR =>", e.message);
}

db.close();
EOF

node assign_gateway.js
rm assign_gateway.js
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
