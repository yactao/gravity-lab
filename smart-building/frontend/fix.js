const fs = require('fs');

const filePath = 'C:/Users/taouf/Documents/antigravity lab/smart-building/frontend/src/app/sites/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The problematic AST 1
const broken1 = `        </>\r\n    )\r\n}\r\n\r\n{\r\n    activeTab === 'equipments' && (`;
const broken1_unix = `        </>\n    )\n}\n\n{\n    activeTab === 'equipments' && (`;

// The valid AST 1
const valid1 = `            </>\r\n            )}\r\n\r\n            {activeTab === 'equipments' && (`;
const valid1_unix = `            </>\n            )}\n\n            {activeTab === 'equipments' && (`;

content = content.replace(broken1, valid1).replace(broken1_unix, valid1_unix);

// The problematic AST 2
const broken2 = `        )\r\n    }\r\n        </div >\r\n    );\r\n}`;
const broken2_unix = `        )\n    }\n        </div >\n    );\n}`;

// The valid AST 2
const valid2 = `            )}\r\n        </div>\r\n    );\r\n}`;
const valid2_unix = `            )}\n        </div>\n    );\n}`;

content = content.replace(broken2, valid2).replace(broken2_unix, valid2_unix);

fs.writeFileSync(filePath, content);
console.log("Replaced successfully (if chunks matched). AST length:", content.length);
