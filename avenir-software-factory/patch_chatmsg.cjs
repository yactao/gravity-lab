const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'aina-frontend', 'src', 'components', 'chat', 'ChatMsg.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'import FinanceTable from "../../utils/FinanceTable";',
    'import FinanceTable from "../../utils/FinanceTable";\nimport AinaScore from "../AinaScore/AinaScore";'
);

content = content.replace(
    'type Props = {\n  messages: Message[];\n  loading: boolean;',
    'type Props = {\n  messages: Message[];\n  loading: boolean;\n  moduleName?: string;'
);

content = content.replace(
    '  loading,\n  onPreview,',
    '  loading,\n  moduleName,\n  onPreview,'
);

// Add Pulse
content = content.replace(
    '<span className="text-sm sm:text-base">Génération...</span>',
    '{moduleName === "Aïna Coder" ? (\n              <div className="flex items-center gap-2">\n                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1.5s_ease-in-out_infinite]" />\n                <span className="text-sm sm:text-base">Analyse en cours par l\\'agent...</span >\n              </div >\n) : (\n < span className = "text-sm sm:text-base" > Génération...</span >\n            )}'
);

// Add AinaScore
content = content.replace(
    '{/* Graphique Aïna Finance */}',
    '{msg.agent === "dev" && <AinaScore content={msg.text} />}\n\n          {/* Graphique Aïna Finance */}'
);

fs.writeFileSync(file, content);
console.log("ChatMsg.tsx mis à jour");
