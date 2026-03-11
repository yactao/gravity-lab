import React from 'react';

interface Props {
    content: string;
}

const extractScore = (text: string, sectionTitle: string): number | null => {
    const sectionRegex = new RegExp(`###[^\\n]*${sectionTitle}[\\s\\S]*?(?=###|$)`, 'i');
    const match = text.match(sectionRegex);
    if (!match) return null;
    const sectionContent = match[0];

    const scoreRegex = /(\d+(?:\.\d+)?)\s*(?:\/|sur)\s*10/i;
    const scoreMatch = sectionContent.match(scoreRegex);
    if (scoreMatch) {
        return parseFloat(scoreMatch[1]);
    }
    return null;
};

export default function AinaScore({ content }: Props) {
    const security = extractScore(content, "Sécurité");
    // Some variation for Refactoring, since the template asks for Refactoring but doesn't explicitly enforce a /10 score in the list for it (it just says "problèmes détectés"), but let's see if the prompt asks for it. 
    // Wait, I updated the prompt:
    // "### 🛡️ Score de Sécurité (Pentest)\n- Note de sécurité sur 10.\n### 🏗️ Conseils de Refactoring (Lead Tech)\n- Problèmes...\n### 🍃 Indice de Frugalité\n- Note d'empreinte écologique / logicielle sur 10." 
    // It only enforces score for Security and Frugality. If refactoring is missing a score, we just omit or use a placeholder.

    const frugality = extractScore(content, "Frugali");

    if (security === null && frugality === null) {
        return null;
    }

    const scores = [];
    if (security !== null) scores.push({ label: "Sécurité", value: security, color: "#ef4444" });
    if (frugality !== null) scores.push({ label: "Frugalité", value: frugality, color: "#10b981" });

    const maxRadius = 36;
    const strokeWidth = 8;
    const center = 50;

    return (
        <div className="flex flex-col items-center gap-4 my-6 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Aïna Core-Coder Analysis</h4>
            <div className="flex gap-8 flex-wrap justify-center">
                {scores.map((s, i) => {
                    const circumference = 2 * Math.PI * maxRadius;
                    const strokeDashoffset = circumference - (s.value / 10) * circumference;
                    return (
                        <div key={i} className="flex flex-col items-center">
                            <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={maxRadius}
                                    fill="transparent"
                                    stroke={s.color}
                                    strokeWidth={strokeWidth}
                                    strokeOpacity={0.15}
                                />
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={maxRadius}
                                    fill="transparent"
                                    stroke={s.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                                />
                                <text
                                    x={center}
                                    y={center}
                                    fill={s.color}
                                    fontSize="22"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className="transform rotate-90 origin-center"
                                >
                                    {s.value}
                                </text>
                            </svg>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2 uppercase tracking-wide">{s.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
