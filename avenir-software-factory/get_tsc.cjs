const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exec('npx tsc -b', { cwd: path.join(__dirname, 'aina-frontend') }, (error, stdout, stderr) => {
    fs.writeFileSync('errors.txt', stdout, 'utf8');
    console.log("Errors written to errors.txt");
});
