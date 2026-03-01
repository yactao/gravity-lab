"use client";

import { useState, useEffect } from "react";
import { Activity, Server, Database, ShieldCheck, AlertTriangle, Clock, Cpu, HardDrive, Wifi, ShieldAlert, Zap } from "lucide-react";

export default function SystemHealthPage() {
    const [healthData, setHealthData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastPing, setLastPing] = useState<number | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const fetchHealth = async () => {
        const start = Date.now();
        try {
            const res = await fetch(`${API_URL}/api/health`);
            if (res.ok) {
                const data = await res.json();
                setHealthData(data);
                setLastPing(Date.now() - start);
            } else {
                setHealthData({ status: "ERROR", error: "API Unreachable", database: "Unknown" });
            }
        } catch (err) {
            setHealthData({ status: "DOWN", error: "Server OFFLINE", database: "Disconnected" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Polling every 10 seconds for monitoring
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        if (!seconds) return "0s";
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);

        if (d > 0) return `${d}j ${h}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    if (loading && !healthData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Activity className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const isHealthy = healthData?.status === "OK";
    const statusColor = isHealthy ? "text-emerald-500" : "text-rose-500";
    const bgStatusColor = isHealthy ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20";
    const StatusIcon = isHealthy ? ShieldCheck : ShieldAlert;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20 mt-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center mb-2">
                        <Activity className="w-8 h-8 mr-3 text-primary" /> Supervision Serveur (Watchdog)
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground max-w-2xl">
                        Tableau de bord de contrôle interne dédié au diagnostic technique des sous-systèmes UBBEE (API, BDD, RAM).
                    </p>
                </div>
                <div className={`flex items-center px-4 py-2 rounded-xl border font-bold text-sm shadow-sm ${bgStatusColor} ${statusColor}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {healthData?.status === "OK" ? "Système Opérationnel" : "Incident Détecté"}
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                        <Server className="w-4 h-4 mr-1.5" /> API Backend
                    </p>
                    <div className="flex items-end justify-between">
                        <h3 className={`text-2xl font-black ${isHealthy ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                            {healthData?.status || "Inconnu"}
                        </h3>
                        {lastPing !== null && (
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                {lastPing} ms
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-1.5" /> Base de Données
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {healthData?.database || "Inconnu"}
                    </h3>
                    {healthData?.database === "Connected" && <p className="text-[10px] text-slate-400 mt-1">Requête test acceptée</p>}
                </div>

                <div className="bg-white dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                        <Cpu className="w-4 h-4 mr-1.5" /> RAM Heap Used
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {healthData?.memory?.heapUsed || "---"}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Total Alloué : {healthData?.memory?.heapTotal || "---"}</p>
                </div>

                <div className="bg-white dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" /> Process Uptime
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatUptime(healthData?.uptime)}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Depuis le dernier crash/reboot</p>
                </div>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                <div className="bg-slate-50 dark:bg-[#0B1120] p-8 rounded-2xl border border-slate-200 dark:border-white/10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <StatusIcon className={`w-6 h-6 mr-2 ${statusColor}`} /> Diagnostic Global
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Synchronisation Horaire</span>
                            <span className="text-sm font-mono text-slate-900 dark:text-white">{new Date(healthData?.timestamp || Date.now()).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Environnement Node.js</span>
                            <span className="text-sm font-mono text-emerald-500 font-bold">Production (PM2)</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Module WebSocket</span>
                            <span className="text-sm font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">En Ligne</span>
                        </div>
                        <div className="flex justify-between items-center pb-4">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Dernière Erreur Détectée</span>
                            <span className={`text-sm font-bold ${healthData?.error ? 'text-rose-500' : 'text-slate-400'}`}>
                                {healthData?.error || "Aucune erreur signalée"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex flex-col justify-center">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-indigo-500" /> Gardien Externe Automatique
                        </h3>
                        <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80">
                            L'API de supervision `GET /api/health` est maintenant exposée publiquement. Vous pouvez configurer UptimeRobot ou BetterStack pour pinguer ce serveur toutes les X minutes.
                        </p>
                    </div>

                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-500/30">
                        <label className="text-xs font-bold text-indigo-900/50 dark:text-indigo-400/50 uppercase tracking-widest block mb-2">Endpoint de Supervision à tracker</label>
                        <div className="flex items-center justify-between">
                            <code className="text-sm text-indigo-900 dark:text-indigo-100 font-bold">{API_URL}/api/health</code>
                            <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-1 rounded">GET</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

