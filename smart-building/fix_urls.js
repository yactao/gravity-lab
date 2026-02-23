const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace double-quoted URL strings ending right away
    // e.g. "http://localhost:3001" -> (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    content = content.replace(/"http:\/\/localhost:3001"/g, '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")');

    // 2. Replace single-quoted URL strings ending right away
    content = content.replace(/'http:\/\/localhost:3001'/g, '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")');

    // 3. Replace double-quoted URLs with paths
    // e.g. "http://localhost:3001/api/readings" -> `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/readings`
    content = content.replace(/"http:\/\/localhost:3001([^"]*)"/g, '\`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}$1\`');

    // 4. Replace single-quoted URLs with paths
    content = content.replace(/'http:\/\/localhost:3001([^']*)'/g, '\`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}$1\`');

    // 5. Replace backtick strings with template var
    // e.g. \`http://localhost:3001/api/...\` -> \`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/...\`
    content = content.replace(/\`http:\/\/localhost:3001([^\`]*)\`/g, '\`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}$1\`');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

traverseDir('./frontend/src');
console.log('Done scanning and replacing URLs.');
