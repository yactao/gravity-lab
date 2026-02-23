const { Client } = require('ssh2');
const fs = require('fs');

const script = `
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

node -e "
async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@ubbee.fr', password: 'password' })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    const orgId = loginData.user.organizationId;
    
    console.log('Login OK, OrgID:', orgId);
    
    const sitesRes = await fetch('http://127.0.0.1:3001/api/sites', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'x-organization-id': orgId,
        'x-user-role': 'ENERGY_MANAGER'
      }
    });
    const sitesData = await sitesRes.json();
    console.log('SITES FETCHED:', JSON.stringify(sitesData, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
"
`;

const conn = new Client();
conn.on('ready', () => {
    conn.exec(script, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            fs.writeFileSync('vps_output_27.txt', output);
            console.log('Output saved to vps_output_27.txt');
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
