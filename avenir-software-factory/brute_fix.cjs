const fs = require('fs');
const path = require('path');

const p1 = path.join(__dirname, 'aina-frontend', 'src', 'components', 'CardNav', 'CardNav.tsx');
fs.writeFileSync(p1, `import React from 'react';\nexport default function CardNav() { return <div className="p-4 text-center">Navigation (Mode Frugal)</div>; }\n`);

const p2 = path.join(__dirname, 'aina-frontend', 'src', 'utils', 'BlurText.tsx');
fs.writeFileSync(p2, `import React from 'react';\nexport default function BlurText({ text, className }: any) { return <span className={className}>{text}</span>; }\n`);

const p3 = path.join(__dirname, 'aina-frontend', 'src', 'components', 'LightRays', 'LightRays.tsx');
fs.writeFileSync(p3, `import React from 'react';\nexport default function LightRays() { return null; }\n`);

console.log("Les 3 composants problématiques ont été réécrits en version Frugale.");
