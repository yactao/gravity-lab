const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'aina-frontend', 'src');

const filesToMock = [
    'components/finance/VetFinanceTable.tsx',
    'utils/FinanceTable.tsx',
    'utils/exportUtils.ts',
    'utils/JsonTable.tsx',
    'components/CardNav/CardNav.tsx',
    'components/LightRays/LightRays.tsx'
];

filesToMock.forEach(f => {
    const p = path.join(srcDir, f);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Mocks
    const xlsxMock = `\nconst XLSX: any = { utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} }, writeFile: () => {} };\n`;
    const gsapMock = `\nconst gsap: any = { to: () => ({}), fromTo: () => ({}), set: () => ({}), timeline: () => ({ to: () => ({}), fromTo: () => ({}) }) };\n`;
    const oglMock = `\nconst Renderer: any = class { constructor() { this.gl = { canvas: document.createElement('canvas') }; } }; const Triangle: any = class {}; const Program: any = class {}; const Mesh: any = class {};\n`;

    if (content.match(/XLSX\./) && !content.includes('const XLSX: any')) {
        content = xlsxMock + content;
    }
    if (content.match(/gsap\./) && !content.includes('const gsap: any')) {
        content = gsapMock + content;
    }
    if (content.includes('Renderer') && f.includes('LightRays.tsx') && !content.includes('const Renderer: any')) {
        content = oglMock + content;
    }

    // also run framer-motion purge again if needed
    content = content.replace(/^import\s+.*framer-motion['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*motion['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*gsap['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*ogl['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*xlsx['"];?\r?\n/gm, '');

    fs.writeFileSync(p, content);
});

console.log("Mocks appliqués.");
