const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "==== TEST TYPEORM FIND ===="
cd /opt/gravity-lab/smart-building/backend

cat > test-typeorm.js << 'EOF'
const { DataSource } = require('typeorm');
const { Site } = require('./dist/src/entities/site.entity');
const { Organization } = require('./dist/src/entities/organization.entity');
const { Zone } = require('./dist/src/entities/zone.entity');
const { Gateway } = require('./dist/src/entities/gateway.entity');
const { Sensor } = require('./dist/src/entities/sensor.entity');
const { User } = require('./dist/src/entities/user.entity');
const { Reading } = require('./dist/src/entities/reading.entity');
const { Alert } = require('./dist/src/entities/alert.entity');

async function test() {
    const dataSource = new DataSource({
        type: 'better-sqlite3',
        database: 'smartbuild_v3.sqlite',
        entities: [Site, Organization, Zone, Gateway, Sensor, User, Reading, Alert]
    });

    await dataSource.initialize();
    const siteRepo = dataSource.getRepository(Site);
    
    console.log("-> TEST 1: organization: { id }");
    const test1 = await siteRepo.find({ 
        where: { organization: { id: '11111111-1111-1111-1111-111111111111' } },
        relations: ['zones']
    });
    console.log("Test 1 count:", test1.length);

    console.log("-> TEST 2: organizationId direct");
    const test2 = await siteRepo.find({ 
        where: { organizationId: '11111111-1111-1111-1111-111111111111' },
        relations: ['zones']
    });
    console.log("Test 2 count:", test2.length);

    console.log("-> TEST 3: all sites without where");
    const test3 = await siteRepo.find({});
    console.log("Total sites:", test3.length);

    await dataSource.destroy();
}

test().catch(console.error);
EOF

node test-typeorm.js
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_25.txt', output);
            console.log('Output saved to vps_output_25.txt');
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
