"use client";

import { useState, useEffect } from "react";
import { Wifi, Activity, Server, AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, Cpu, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTenant } from "@/lib/TenantContext";

export default function NetworkMonitoringPage() {
    const { authFetch } = useTenant();
    const [gateways, setGateways] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGateways = async () => {
        setLoading(true);
        try {
            const res = await authFetch("http://localhost:3001/api/gateways");
            if (res.ok) {
                setGateways(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGateways();
    }, [authFetch]);

    // KPI Calc
    const offlineGateways = gateways.filter(g => g.status === 'offline').length;
    const totalDevices = gateways.reduce((acc, g) => acc + (g.sensors?.length || 0), 0);
    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pb-12 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2 flex items-center">
                        <Wifi className="h-8 w-8 text-primary mr-3" />
                        Network Monitoring
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">Surveillance de l'infrastructure IoT, des routeurs et des capteurs de la flotte.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={fetchGateways} className="glass border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 transition-colors flex items-center">
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading ? "animate-spin" : "")} />
                        Actualiser
                    </button>
                    <Link href="/onboarding" className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center transition-all">
                        Déployer une Passerelle
                    </Link>
                </div>
            </div>

            {/* Top KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group border-slate-200 dark:border-white/5 hover:border-slate-200 dark:border-white/10 transition-colors">
                    <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-full mb-3 border border-slate-200 dark:border-white/10">
                        <Server className="h-6 w-6 text-slate-900 dark:text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{gateways.length}</h3>
                    <p className="text-slate-500 dark:text-muted-foreground text-xs font-medium uppercase tracking-wider">Gateways Déployées</p>
                </div>
                <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group border-cyan-500/20">
                    <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
                    <div className="p-3 bg-cyan-500/20 rounded-full mb-3 border border-cyan-500/30 relative z-10">
                        <Cpu className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">{totalDevices}</h3>
                    <p className="text-cyan-400/80 text-xs font-medium uppercase tracking-wider relative z-10">Terminaux IoT (Nodes)</p>
                </div>
                <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group border-slate-200 dark:border-white/5 hover:border-slate-200 dark:border-white/10 transition-colors">
                    <div className="p-3 bg-emerald-500/20 rounded-full mb-3 border border-emerald-500/30">
                        <Activity className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">98.5<span className="text-lg text-slate-500 dark:text-muted-foreground">%</span></h3>
                    <p className="text-slate-500 dark:text-muted-foreground text-xs font-medium uppercase tracking-wider">Disponibilité Globale</p>
                </div>
                <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group border-red-500/20">
                    <div className="absolute inset-0 bg-red-500/5"></div>
                    <div className="p-3 bg-red-500/20 rounded-full mb-3 border border-red-500/30 relative z-10">
                        <AlertTriangle className={cn("h-6 w-6 text-red-500", offlineGateways > 0 ? "animate-pulse" : "")} />
                    </div>
                    <h3 className="text-3xl font-bold text-red-400 mb-1 relative z-10">{offlineGateways}</h3>
                    <p className="text-red-400/80 text-xs font-medium uppercase tracking-wider relative z-10">Gateway(s) Hors Ligne</p>
                </div>
            </div>

            {/* Gateway List */}
            <div className="glass-card rounded-2xl overflow-hidden border-slate-200 dark:border-white/5">
                <div className="px-6 py-4 flex justify-between items-center bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Topologie du Réseau</h3>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher une IP, ID..."
                            className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-primary/50 text-sm text-slate-900 dark:text-white rounded-lg pl-9 pr-4 py-2 outline-none w-64 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground border-b border-slate-200 dark:border-white/5">
                                <th className="px-6 py-4 font-medium">Gateway ID</th>
                                <th className="px-6 py-4 font-medium">Site & Emplacement</th>
                                <th className="px-6 py-4 font-medium">Protocole</th>
                                <th className="px-6 py-4 font-medium text-center">Statut</th>
                                <th className="px-6 py-4 font-medium text-center">Noeuds Attachés</th>
                                <th className="px-6 py-4 font-medium text-right">Dernière MaJ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {gateways.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Aucune gateway détectée pour le moment.</td>
                                </tr>
                            )}
                            {gateways.map((gw) => (
                                <tr key={gw.id} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{gw.name || gw.serialNumber}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-muted-foreground mt-0.5 font-mono">{gw.serialNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white/80">{gw.site?.name || "Non assigné"}</td>
                                    <td className="px-6 py-4">
                                        <span className="uppercase text-xs font-bold tracking-wider inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                                            {gw.protocol === 'lorawan' && <Radio className="w-3 h-3 mr-1.5 text-cyan-500" />}
                                            {gw.protocol === 'zigbee' && <Wifi className="w-3 h-3 mr-1.5 text-orange-500" />}
                                            {(!gw.protocol) && <Server className="w-3 h-3 mr-1.5 text-slate-400" />}
                                            {gw.protocol || "Inconnu"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
                                                gw.status === "online" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    gw.status === "warning" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {gw.status === "online" && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                {gw.status === "warning" && <AlertTriangle className="w-3 h-3 mr-1.5" />}
                                                {gw.status === "offline" && <XCircle className="w-3 h-3 mr-1.5" />}
                                                {gw.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white group-hover:border-primary/50 transition-colors">
                                            {gw.sensors?.length || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-500 dark:text-muted-foreground">
                                        {new Date(gw.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
