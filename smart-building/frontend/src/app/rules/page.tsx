"use client";

import { useState, useEffect } from "react";
import { Sparkles, Building, Box, Activity, Zap, Play, Send, Bot, User, Plus, ArrowRight, Save, Settings2, Thermometer, Wind, Lightbulb, Leaf, Moon, ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

// Options dynamiques récupérées via API au lieu de données mockées
const conditions = [
    { icon: Thermometer, name: "Température", operators: [">", "<", "="], value: "°C" },
    { icon: User, name: "Présence", operators: ["Oui", "Non", "Durée"], value: "min" },
    { icon: Wind, name: "CO2", operators: [">", "<"], value: "ppm" },
];
const actionsList = [
    { icon: ShieldAlert, name: "Créer Alerte Critique" },
    { icon: AlertTriangle, name: "Créer Alerte Warning" },
    { icon: Thermometer, name: "Ajuster Consigne CVC" },
    { icon: Lightbulb, name: "Allumer/Éteindre Lumières" },
    { icon: Zap, name: "Couper Alimentation" },
];

export default function RulesPage() {
    const { authFetch } = useTenant();
    const [sites, setSites] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
        { role: "ai", text: "Bonjour ! Je suis votre Assistant SmartBuild. Demandez-moi de créer une règle, par exemple : 'Si l'Open Space est vide pendant 30 min, coupe les lumières et baisse le chauffage de 2 degrés'." }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Visualizer State (Support for Complex Rules)
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [isComplex, setIsComplex] = useState(false);
    const [triggers, setTriggers] = useState<Array<{ name: string, condition: string, value: string }>>([]);
    const [actions, setActions] = useState<Array<{ name: string, target: string }>>([]);

    useEffect(() => {
        authFetch("http://localhost:3001/api/sites")
            .then(res => res.json())
            .then(data => {
                setSites(data);
                if (data.length > 0) {
                    // Update state correctly to trigger availableRooms update
                    setSelectedBuilding(data[0].name);
                }
            })
            .catch(console.error);
    }, [authFetch]);

    const currentSite = sites.find(s => s.name === selectedBuilding);
    const availableRooms = currentSite?.zones?.map((z: any) => z.name) || [];

    const handleSimulateAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        // Add User Message
        const userMsg = chatInput;
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setChatInput("");
        setIsGenerating(true);

        try {
            const res = await authFetch("http://localhost:3001/api/ai/generate-rule", {
                method: "POST",
                body: JSON.stringify({ prompt: userMsg })
            });

            if (res.ok) {
                const data = await res.json();

                // Add AI Message explaining what it did
                setMessages(prev => [...prev, { role: "ai", text: data.message }]);

                // Auto-populate the visual builder with AI extracted parameters
                const { building, room, isComplex, triggers: aiTriggers, actions: aiActions } = data.interpretations;
                setSelectedBuilding(building);
                setSelectedRoom(room);
                setIsComplex(isComplex);
                setTriggers(aiTriggers || []);
                setActions(aiActions || []);
            } else {
                setMessages(prev => [...prev, { role: "ai", text: "❌ Désolé, je n'ai pas pu analyser votre demande (Erreur API)." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "ai", text: "❌ Moteur IA inaccessible. Le serveur backend est-il lancé ?" }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveRule = async () => {
        if (triggers.length === 0 || actions.length === 0) {
            setMessages(prev => [...prev, { role: "ai", text: "⚠️ Veuillez configurer au moins un déclencheur et une action avant de sauvegarder." }]);
            return;
        }

        setIsSaving(true);
        try {
            // Simplified save for the demo (taking the first trigger/action if multiple)
            const primaryTrigger = triggers[0];
            const primaryAction = actions[0];

            // Normalisation du capteur
            const sensorMap: Record<string, string> = { "Température": "temperature", "Présence": "presence", "CO2": "co2" };
            const sensorType = sensorMap[primaryTrigger.name] || primaryTrigger.name.toLowerCase();

            // Extraction de la valeur numérique
            const conditionValue = parseFloat(primaryTrigger.value) || 0;

            const payload = {
                building: selectedBuilding,
                room: selectedRoom,
                sensorType,
                conditionOperator: primaryTrigger.condition === "Non" ? "=" : primaryTrigger.condition, // Simplification pour démo
                conditionValue: primaryTrigger.condition === "Non" ? 0 : conditionValue,
                actionName: primaryAction.name,
                actionTarget: primaryAction.target,
                isActive: true
            };

            const res = await authFetch("http://localhost:3001/api/rules", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessages(prev => [...prev, { role: "ai", text: "✅ Règle déployée avec succès sur le moteur backend mondial !" }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", text: "❌ Erreur de l'API lors de la sauvegarde." }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: "ai", text: "❌ Serveur inaccessible." }]);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6 max-w-7xl mx-auto pt-4 pb-12">

            {/* LEFT PANE: Visual Rule Builder (No-Code Engine) */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center text-slate-900 dark:text-white mb-2">
                            <Settings2 className="h-8 w-8 mr-3 text-primary" />
                            <h1 className="text-3xl font-bold tracking-tight">Moteur de Règles</h1>
                        </div>
                        <p className="text-slate-500 dark:text-muted-foreground font-medium">Création de scénarios automatisés (No-Code).</p>
                    </div>
                    <button
                        disabled={isSaving}
                        onClick={handleSaveRule}
                        className="px-5 py-2.5 bg-primary hover:bg-emerald-400 text-slate-900 dark:text-white font-bold rounded-lg transition-all flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] disabled:opacity-50"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {isSaving ? "Sauvegarde..." : "Sauvegarder et Activer"}
                    </button>
                </div>

                <div className="flex-1 glass-card p-8 overflow-y-auto custom-scrollbar flex flex-col !bg-white dark:!bg-[#0B1120]">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-white/10 pb-4">Configuration Manuelle (Visual Editor)</h2>

                    <div className="flex flex-col items-center flex-1 max-w-3xl mx-auto w-full relative">

                        {/* Connecting Line (background) */}
                        <div className="absolute left-[27px] top-6 bottom-16 w-1 bg-slate-200 dark:bg-white/10 z-0"></div>

                        {/* Step 1: Scope (Where) */}
                        <div className="w-full relative z-10 mb-8 flex group">
                            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center mr-6 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Building className="h-6 w-6 text-primary" />
                            </div>
                            <div className="glass-panel p-5 rounded-xl w-full flex-1 hover:border-primary/30 transition-colors">
                                <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">1. Portée d'Application (Where)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 dark:text-muted-foreground mb-1 block">Bâtiment</label>
                                        <select
                                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                            value={selectedBuilding}
                                            onChange={(e) => {
                                                setSelectedBuilding(e.target.value);
                                                if (e.target.value === "Global") setSelectedRoom("");
                                            }}
                                        >
                                            <option value="Global">🏢 Tous les bâtiments (Global)</option>
                                            {sites.map(s => <option key={s.id} value={s.name}>{s.name} ({s.city})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 dark:text-muted-foreground mb-1 block">Zone / Pièce</label>
                                        <select
                                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            value={selectedRoom}
                                            onChange={(e) => setSelectedRoom(e.target.value)}
                                            disabled={selectedBuilding === "Global"}
                                        >
                                            <option value="">Tous les espaces</option>
                                            {availableRooms.map((r: string) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Trigger (If) */}
                        <div className="w-full relative z-10 mb-8 flex group">
                            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center mr-6 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Activity className="h-6 w-6 text-amber-500" />
                            </div>
                            <div className="glass-panel p-5 rounded-xl w-full flex-1 hover:border-amber-500/30 transition-colors">
                                <h3 className="text-sm font-semibold text-amber-500 mb-3 uppercase tracking-wider">2. Condition Déclencheur (If)</h3>

                                {triggers.length > 0 ? (
                                    <div className="space-y-3">
                                        {triggers.map((t, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 relative">
                                                {index > 0 && <div className="absolute -top-3 left-4 text-[10px] font-bold text-amber-500 bg-white dark:bg-[#0B1120] px-1">ET</div>}
                                                <span className="text-sm font-medium text-slate-900 dark:text-white shrink-0">{t.name}</span>
                                                <select
                                                    value={t.condition}
                                                    onChange={e => {
                                                        const newTriggers = [...triggers];
                                                        newTriggers[index].condition = e.target.value;
                                                        setTriggers(newTriggers);
                                                    }}
                                                    className="w-12 h-8 bg-slate-100 dark:bg-black/50 border border-amber-500/20 text-amber-500 rounded text-xs font-bold font-mono outline-none focus:border-amber-500"
                                                >
                                                    <option value=">">&gt;</option>
                                                    <option value="<">&lt;</option>
                                                    <option value="=">=</option>
                                                </select>
                                                <div className="flex items-center flex-1">
                                                    <input
                                                        type="number"
                                                        value={t.value}
                                                        onChange={e => {
                                                            const newTriggers = [...triggers];
                                                            newTriggers[index].value = e.target.value;
                                                            setTriggers(newTriggers);
                                                        }}
                                                        className="w-20 h-8 px-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 border-r-0 text-slate-900 dark:text-white text-sm font-mono rounded-l outline-none focus:border-primary"
                                                        placeholder="Valeur"
                                                    />
                                                    <span className="h-8 px-2 bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 border-l-0 text-slate-500 text-xs rounded-r flex items-center">
                                                        {conditions.find(c => c.name === t.name)?.value || ""}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => setTriggers([])} className="text-xs text-red-400 hover:text-red-300 w-full text-right mt-2">Effacer les déclencheurs</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {conditions.map(c => (
                                            <button onClick={() => setTriggers([{ name: c.name, condition: ">", value: "" }])} key={c.name} className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:bg-white/5 hover:border-amber-500/50 transition-all">
                                                <c.icon className="h-6 w-6 text-slate-500 dark:text-muted-foreground mb-2" />
                                                <span className="text-xs font-medium text-slate-900 dark:text-white">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Action (Then) */}
                        <div className="w-full relative z-10 flex group">
                            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center mr-6 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <Play className="h-6 w-6 text-cyan-400 fill-cyan-400" />
                            </div>
                            <div className="glass-panel p-5 rounded-xl w-full flex-1 hover:border-cyan-400/30 transition-colors">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">3. Action à Exécuter (Then)</h3>

                                {actions.length > 0 ? (
                                    <div className="space-y-3">
                                        {actions.map((act, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 relative">
                                                {index > 0 && <div className="absolute -top-3 left-4 text-[10px] font-bold text-cyan-400 bg-white dark:bg-[#0B1120] px-1">ET</div>}
                                                <span className="text-sm font-medium text-slate-900 dark:text-white shrink-0">{act.name}</span>
                                                <ArrowRight className="h-4 w-4 text-slate-500 dark:text-muted-foreground shrink-0" />
                                                <input
                                                    type="text"
                                                    value={act.target}
                                                    onChange={e => {
                                                        const newActions = [...actions];
                                                        newActions[index].target = e.target.value;
                                                        setActions(newActions);
                                                    }}
                                                    className="flex-1 min-w-0 h-8 px-2 bg-slate-100 dark:bg-black/50 border border-cyan-400/20 text-cyan-500 dark:text-cyan-300 rounded text-xs font-bold font-mono outline-none focus:border-cyan-400"
                                                    placeholder="Cible / Valeur..."
                                                />
                                            </div>
                                        ))}
                                        <button onClick={() => setActions([])} className="text-xs text-red-400 hover:text-red-300 w-full text-right mt-2">Effacer les actions</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {actionsList.map(a => (
                                            <button onClick={() => setActions([{ name: a.name, target: "Config..." }])} key={a.name} className="flex items-center p-3 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:bg-white/5 hover:border-cyan-400/50 transition-all text-left">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mr-3">
                                                    <a.icon className="h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-900 dark:text-white">{a.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* RIGHT PANE: AI Assistant (SmartBuild Copilot) */}
            <div className="w-[400px] glass-card flex flex-col overflow-hidden relative border-primary/20">

                {/* Animated AI Glow */}
                <div className="absolute top-0 inset-x-0 h-1bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 z-0"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full point-events-none z-0"></div>

                <div className="p-5 border-b border-primary/20 bg-primary/5 flex items-center relative z-10">
                    <div className="relative mr-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B1120]"></div>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold tracking-wide">SmartBuild AI</h3>
                        <p className="text-xs text-primary/80 font-medium">Assistant de Création</p>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4 relative z-10">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-lg",
                                msg.role === "user"
                                    ? "bg-slate-700 text-slate-900 dark:text-white rounded-tr-sm border border-slate-200 dark:border-white/10"
                                    : "bg-primary/10 text-slate-900 dark:text-white rounded-tl-sm border border-primary/20 backdrop-blur-md"
                            )}>
                                {msg.role === "ai" && <Bot className="h-4 w-4 mb-2 text-primary" />}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isGenerating && (
                        <div className="flex justify-start">
                            <div className="bg-primary/10 rounded-2xl rounded-tl-sm p-4 border border-primary/20 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Templates Shortcuts */}
                <div className="px-5 pb-2 pt-0 z-10 flex gap-2 overflow-x-auto custom-scrollbar">
                    <button
                        onClick={() => { setChatInput("Mets en place un Anti-gaspillage fenêtre pour les CVC"); handleSimulateAI(new Event('submit') as any); }}
                        className="shrink-0 whitespace-nowrap flex items-center bg-slate-200/50 dark:bg-white/10 hover:bg-primary hover:text-slate-900 border border-slate-300 dark:border-white/20 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                        <Leaf className="w-3 h-3 mr-1.5" /> Anti-Gaspi Fenêtre
                    </button>
                    <button
                        onClick={() => { setChatInput("Configure l'extinction globale la nuit à 20h"); handleSimulateAI(new Event('submit') as any); }}
                        className="shrink-0 whitespace-nowrap flex items-center bg-slate-200/50 dark:bg-white/10 hover:bg-primary hover:text-slate-900 border border-slate-300 dark:border-white/20 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                        <Moon className="w-3 h-3 mr-1.5" /> Veille Nocturne
                    </button>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 relative z-10">
                    <form onSubmit={handleSimulateAI} className="relative flex items-center group">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ex: Éteins tout à 20h00..."
                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || isGenerating}
                            className="absolute right-2 p-2 bg-primary hover:bg-emerald-400 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-slate-500 dark:text-muted-foreground mt-3 font-medium">L'IA convertira votre texte en logique système.</p>
                </div>
            </div>

        </div>
    );
}
