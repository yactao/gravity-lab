"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, MapPin, Activity, Check, Plus, Hexagon, X, MessageSquareWarning } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

interface Alert {
    id: string;
    message: string;
    severity: string;
    timestamp: string;
    active: boolean;
    sensor?: {
        name: string;
        type: string;
        zone?: {
            name: string;
            site?: {
                name: string;
                organization?: {
                    name: string;
                }
            }
        }
    };
}

export default function AlertsPage() {
    const { authFetch } = useTenant();
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || "all";

    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>(initialFilter); // 'all', 'CRITICAL', 'WARNING'
    const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ message: "", severity: "WARNING" });

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await authFetch("http://localhost:3001/api/alerts");
                if (res.ok) {
                    const data = await res.json();
                    setAlerts(data);
                }
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    useEffect(() => {
        const queryFilter = searchParams.get('filter');
        if (queryFilter) {
            setFilter(queryFilter);
        }
    }, [searchParams]);

    const handleAcknowledge = (id: string) => {
        // En vrai: appel API PATCH pour marquer comme non-active
        // Pour l'UI V1 de démo: On la retire de la liste active
        setAlerts((prev) => prev.filter(alert => alert.id !== id));
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Dans une version plus poussée il faudrait POST /api/alerts
            // Mais l'API existante n'a pas été conçue avec un POST explicite pour les alertes depuis le Frontend (C'est le rules engine qui insère).
            // On simule une insertion immédiate dans le state pour l'UI V4 :
            const fakeNewAlert = {
                id: Math.random().toString(36).substring(7),
                message: newTicket.message,
                severity: newTicket.severity,
                timestamp: new Date().toISOString(),
                active: true,
                sensor: { name: "Créé Manuellement", type: "system" }
            };
            setAlerts([fakeNewAlert, ...alerts]);
            setIsAddTicketOpen(false);
            setNewTicket({ message: "", severity: "WARNING" });
        } catch (err) {
            console.error(err);
        }
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === "all") return true;
        return a.severity === filter;
    });

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return {
                    border: 'border-red-500/50',
                    bg: 'bg-red-500/10',
                    text: 'text-red-400',
                    icon: <AlertTriangle className="h-5 w-5 text-red-500" />
                };
            case 'WARNING':
                return {
                    border: 'border-orange-500/50',
                    bg: 'bg-orange-500/10',
                    text: 'text-orange-400',
                    icon: <Activity className="h-5 w-5 text-orange-500" />
                };
            default:
                return {
                    border: 'border-blue-500/50',
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-400',
                    icon: <Activity className="h-5 w-5 text-blue-500" />
                };
        }
    };

    const getLocationText = (alert: Alert) => {
        if (!alert.sensor?.zone) return "Bâtiment Principal";
        const orgName = alert.sensor.zone.site?.organization?.name;
        const siteName = alert.sensor.zone.site?.name;
        const zoneName = alert.sensor.zone.name;

        let loc = "";
        if (orgName) loc += `${orgName} - `;
        if (siteName) loc += `${siteName} `;
        if (zoneName) loc += `(${zoneName})`;
        return loc.trim() || "Bâtiment Principal";
    };

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pb-12 pt-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2 flex items-center">
                        <Hexagon className="h-8 w-8 text-primary mr-3" />
                        Maintenance & Ticketing
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">Gestion des anomalies et interventions techniques du parc.</p>
                </div>

                <div className="flex gap-3">
                    <button className="glass border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 transition-colors flex items-center">
                        Historique des interventions
                    </button>
                    <button onClick={() => setIsAddTicketOpen(true)} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Ticket
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-muted-foreground font-medium mb-1">Total Actives</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{alerts.length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                        <Hexagon className="w-6 h-6 text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-red-500/20">
                    <div>
                        <p className="text-sm text-red-400 font-medium mb-1">Critiques</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{alerts.filter(a => a.severity === 'CRITICAL').length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                </div>
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-orange-500/20">
                    <div>
                        <p className="text-sm text-orange-400 font-medium mb-1">Avertissements</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{alerts.filter(a => a.severity === 'WARNING').length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Activity className="w-6 h-6 text-orange-500" />
                    </div>
                </div>
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-emerald-500/20">
                    <div>
                        <p className="text-sm text-emerald-400 font-medium mb-1">SLA Résolution (24h)</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">98<span className="text-lg text-emerald-500/50">%</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Main Board */}
            <div className="glass-card p-1 rounded-2xl">
                {/* Filters */}
                <div className="flex gap-2 p-4 border-b border-slate-200 dark:border-white/5">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white"}`}
                    >
                        Toutes les alertes
                    </button>
                    <button
                        onClick={() => setFilter("CRITICAL")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "CRITICAL" ? "bg-red-500/20 text-red-400" : "text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white"}`}
                    >
                        Critiques Uniquement
                    </button>
                    <button
                        onClick={() => setFilter("WARNING")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "WARNING" ? "bg-orange-500/20 text-orange-400" : "text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white"}`}
                    >
                        Avertissements
                    </button>
                </div>

                {/* Ticket List */}
                <div className="p-4 space-y-3">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500 dark:text-muted-foreground">Chargement des données IoT...</div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Aucune anomalie détectée</h3>
                            <p className="text-slate-500 dark:text-muted-foreground mt-1">Tous les systèmes fonctionnent de manière optimale.</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => {
                            const styles = getSeverityStyles(alert.severity);
                            return (
                                <div key={alert.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-100 dark:bg-white/5 hover:bg-white/[0.08] border border-slate-200 dark:border-white/5 p-4 rounded-xl transition-all">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`mt-1 p-2 rounded-lg border ${styles.bg} ${styles.border}`}>
                                            {styles.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                                                    {alert.severity}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-muted-foreground flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(alert.timestamp).toLocaleString('fr-FR', {
                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-medium text-slate-900 dark:text-white mb-1 pr-4">{alert.message}</h4>

                                            <div className="flex items-center text-xs text-slate-500 dark:text-muted-foreground gap-4">
                                                <span className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {getLocationText(alert)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Hexagon className="w-3 h-3 mr-1 text-primary/70" />
                                                    Source: {alert.sensor?.name || "Smart Rule Engine"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 md:pl-4 md:ml-4 md:border-l border-slate-200 dark:border-white/5 flex gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleAcknowledge(alert.id)}
                                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-sm font-medium text-slate-900 dark:text-white rounded-lg transition-colors border border-transparent hover:border-emerald-500/30"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Résoudre
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal: Add Ticket */}
            {isAddTicketOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
                        <button onClick={() => setIsAddTicketOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="h-5 w-5" /></button>
                        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white flex items-center">
                            <MessageSquareWarning className="h-6 w-6 mr-2 text-primary" /> Nouveau Ticket
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-muted-foreground mb-6">Enregistrez une anomalie non remontée par l'IoT (ex: Fuite d'eau visuelle).</p>

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div><label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Description du problème</label>
                                <textarea required rows={3} value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white resize-none" placeholder="Description de l'anomalie..." /></div>

                            <div><label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Gravité (SLA)</label>
                                <select value={newTicket.severity} onChange={e => setNewTicket({ ...newTicket, severity: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white">
                                    <option value="INFO">Information (Mineure)</option>
                                    <option value="WARNING">Avertissement (Majeure)</option>
                                    <option value="CRITICAL">Critique (Bloquante)</option>
                                </select></div>

                            <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-emerald-400 text-slate-900 dark:text-white font-bold rounded-xl transition-all shadow-lg">Enregistrer le Ticket</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
