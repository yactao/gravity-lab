"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, Server, ShieldCheck, MapPin, Tag, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

export default function HardwareInventoryPage() {
    const { authFetch } = useTenant();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState<any[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMac, setNewMac] = useState("");
    const [newModel, setNewModel] = useState("U-Bot Pro v2");
    const [preAssignSite, setPreAssignSite] = useState("");

    const fetchInventory = async () => {
        setLoading(true);
        // Mock data since we don't have the real endpoint yet
        setTimeout(() => {
            setInventory([
                { id: "1", mac: "00:1A:2B:3C:4D:5E", model: "U-Bot Pro v2", status: "in_stock", assignedSite: null, addedAt: "2026-03-01T00:00:00Z" },
                { id: "2", mac: "00:1A:2B:3C:4D:5F", model: "U-Bot Lite", status: "pre_assigned", assignedSite: "c5dae3d8-2d5d-6d3c-bd3c-3c4d5e6f7a8b", addedAt: "2026-02-28T00:00:00Z" },
                { id: "3", mac: "00:1A:2B:3C:4D:60", model: "U-Bot Pro v2", status: "deployed", assignedSite: "1a2f082d-72a2-b281-0081-8b9cad0e1f20", addedAt: "2026-01-15T00:00:00Z" },
            ]);
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        fetchInventory();
        authFetch("http://localhost:3001/api/sites")
            .then(res => res.json())
            .then(data => setSites(data))
            .catch(console.error);
    }, [authFetch]);

    const handleAddHardware = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem = {
            id: Date.now().toString(),
            mac: newMac.toUpperCase(),
            model: newModel,
            status: preAssignSite ? "pre_assigned" : "in_stock",
            assignedSite: preAssignSite || null,
            addedAt: new Date().toISOString()
        };
        setInventory([newItem, ...inventory]);
        setIsAddModalOpen(false);
        setNewMac("");
        setPreAssignSite("");
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2 flex items-center">
                        <Package className="h-8 w-8 text-primary mr-3" />
                        Inventaire Matériel (U-Bots)
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">Gestion du stock, provisioning des Gateways et pré-assignation Plug & Play.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center transition-all"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Provisionner un U-Bot
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 glass-card rounded-2xl overflow-hidden border-slate-200 dark:border-white/5 shadow-lg bg-white/50 dark:bg-slate-900/50 flex flex-col">
                <div className="px-6 py-4 flex justify-between items-center bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <Server className="w-5 h-5 text-indigo-400 mr-2" /> Flotte Enregistrée
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Recherche MAC, Modèle..."
                            className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-primary/50 text-sm text-slate-900 dark:text-white rounded-lg pl-9 pr-4 py-2 outline-none w-64 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-[#0b101d] z-10">
                            <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground border-b border-slate-200 dark:border-white/5">
                                <th className="px-6 py-4 font-medium">Device ID (MAC)</th>
                                <th className="px-6 py-4 font-medium">Modèle</th>
                                <th className="px-6 py-4 font-medium text-center">État du Plug&Play</th>
                                <th className="px-6 py-4 font-medium">Assignation Initiale</th>
                                <th className="px-6 py-4 font-medium text-right">Date d'Ajout</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Chargement de l'inventaire...</td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Aucun appareil dans l'inventaire.</td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 flex items-center">
                                            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg mr-4 border border-slate-200 dark:border-white/10">
                                                <QrCode className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="font-mono font-bold text-slate-900 dark:text-white tracking-widest">{item.mac}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                <Tag className="w-3 h-3 mr-1.5 text-slate-400" /> {item.model}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded border text-xs font-bold tracking-wider uppercase",
                                                item.status === 'in_stock' ? "bg-slate-100 text-slate-600 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20" :
                                                    item.status === 'pre_assigned' ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30" :
                                                        "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                                            )}>
                                                {item.status === 'in_stock' && "En Stock Vierge"}
                                                {item.status === 'pre_assigned' && "Pré-configuré"}
                                                {item.status === 'deployed' && <><ShieldCheck className="w-3 h-3 mr-1" /> Déployé</>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.assignedSite ? (
                                                <div className="flex items-center text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                    <MapPin className="w-3 h-3 mr-1.5 text-primary" />
                                                    {sites.find(s => s.id === item.assignedSite)?.name || "Site inconnu"}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">Aucune</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-500">
                                            {new Date(item.addedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-xs font-bold text-primary hover:text-emerald-400 transition-colors">Gérer</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add Hardware */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <Plus className="w-6 h-6 mr-2 text-primary" /> Nouveau U-Bot
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <Search className="w-5 h-5 rotate-45 transform" />
                            </button>
                        </div>
                        <form onSubmit={handleAddHardware} className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Modèle de Passerelle</label>
                                <select
                                    value={newModel}
                                    onChange={e => setNewModel(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                >
                                    <option>U-Bot Pro v2</option>
                                    <option>U-Bot Lite</option>
                                    <option>U-Bot Outdoor Gateway</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Adresse MAC / Numéro de Série</label>
                                <div className="relative">
                                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="EX: A1:B2:C3:D4:E5:F6"
                                        value={newMac}
                                        onChange={e => setNewMac(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 font-mono uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:font-sans placeholder:normal-case"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Pré-assignation (Optionnel)</label>
                                <p className="text-xs text-slate-500 mb-3">Si pré-assignée, la gateway remontera automatiquement ses données dans ce site dès qu'elle sera branchée sur le terrain.</p>
                                <select
                                    value={preAssignSite}
                                    onChange={e => setPreAssignSite(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                >
                                    <option value="">-- Ne pas assigner (Garder en stock) --</option>
                                    {sites.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Annuler</button>
                                <button type="submit" className="px-6 py-2 rounded-lg font-bold bg-primary hover:bg-emerald-400 text-slate-900 dark:text-white shadow-lg transition-colors">Enregistrer le Matériel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
