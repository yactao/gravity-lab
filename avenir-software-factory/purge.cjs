const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'aina-frontend', 'src');

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
                filelist.push(dirFile);
            }
        }
    });
    return filelist;
}

const files = walkSync(srcDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. imports framer-motion / gsap / motion
    content = content.replace(/^import\s+.*framer-motion['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*motion['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*gsap['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*ogl['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*xlsx['"];?\r?\n/gm, '');
    content = content.replace(/^import\s+.*recharts['"];?\r?\n/gm, '');

    // 2. motion components to regular
    content = content.replace(/<(motion\.[a-zA-Z0-9_]+)/g, match => match.replace('motion.', ''));
    content = content.replace(/<\/(motion\.[a-zA-Z0-9_]+)>/g, match => match.replace('motion.', ''));
    content = content.replace(/<AnimatePresence\b[^>]*>/g, '<>');
    content = content.replace(/<\/AnimatePresence>/g, '</>');

    // Quick fix for recharts
    content = content.replace(/<ResponsiveContainer[^>]*>[\s\S]*?<\/ResponsiveContainer>/g, '<div className="text-slate-400 text-sm p-4 border border-slate-700 rounded bg-slate-800">Graphique désactivé (Mode Frugal)</div>');
    content = content.replace(/<LineChart[^>]*>[\s\S]*?<\/LineChart>/g, '<div className="text-slate-400 text-sm p-4 border border-slate-700 rounded bg-slate-800">Graphique désactivé (Mode Frugal)</div>');
    content = content.replace(/<BarChart[^>]*>[\s\S]*?<\/BarChart>/g, '<div className="text-slate-400 text-sm p-4 border border-slate-700 rounded bg-slate-800">Graphique désactivé (Mode Frugal)</div>');
    content = content.replace(/<PieChart[^>]*>[\s\S]*?<\/PieChart>/g, '<div className="text-slate-400 text-sm p-4 border border-slate-700 rounded bg-slate-800">Graphique désactivé (Mode Frugal)</div>');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
    }
});

console.log(`${changedCount} fichiers purgés des lib lourdes !`);
