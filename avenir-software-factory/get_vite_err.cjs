const { exec } = require('child_process');
const fs = require('fs');

exec('npx vite build', { cwd: __dirname + '/aina-frontend' }, (error, stdout, stderr) => {
    fs.writeFileSync('vite_err_utf8.txt', (stdout || '') + '\n' + (stderr || ''), 'utf8');
});
