const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'aina-frontend', 'src', 'components', 'chat', 'ChatMsg.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Import AinaScore
lines.splice(8, 0, 'import AinaScore from "../AinaScore/AinaScore";');

// Add moduleName to Props and Component
// let's just find and replace by iterating

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('loading: boolean;')) {
        lines.splice(i + 1, 0, '  moduleName?: string;');
        i++;
    }
    if (lines[i].includes('  loading,')) {
        lines.splice(i + 1, 0, '  moduleName,');
        i++;
    }
    if (lines[i].includes('<span className="text-sm sm:text-base">Génération...</span>')) {
        lines[i] = `{moduleName === "Aïna Coder" ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                <span className="text-sm sm:text-base">Analyse en cours par l\\'agent...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Génération...</span>
            )}`;
    }
    if (lines[i].includes('{/* Graphique Aïna Finance */}')) {
        lines.splice(i, 0, '{msg.agent === "dev" && <AinaScore content={msg.text} />}');
        i++;
    }
}

fs.writeFileSync(file, lines.join('\n'));
console.log("Rewrite done");
