"use client";

import { Wrench, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tickets = [
    { id: "T-892", title: "Filtre CVC obstrué", location: "Open Space R+1", priority: "High", status: "open", time: "Il y a 2h" },
    { id: "T-891", title: "Calibration Sonde CO2", location: "Salle Réunion B", priority: "Medium", status: "in_progress", time: "Hier" },
    { id: "T-890", title: "Mise à jour firmware Gateway", location: "Baie Serveur", priority: "Low", status: "closed", time: "Il y a 3 jours" },
];

export default function MaintenancePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                        <Wrench className="h-8 w-8 text-primary mr-3" />
                        Maintenance & Équipements
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground">Gestion des interventions techniques et cycle de vie du matériel.</p>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Tickets List */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tickets d'Intervention Actifs</h3>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between hover:bg-slate-200 dark:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex items-center">
                                    <div className={cn(
                                        "h-10 w-10 flex items-center justify-center rounded-full mr-4 border",
                                        ticket.status === 'open' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                            ticket.status === 'in_progress' ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                                                "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                    )}>
                                        {ticket.status === 'open' ? <AlertCircle className="h-5 w-5" /> :
                                            ticket.status === 'in_progress' ? <Clock className="h-5 w-5" /> :
                                                <CheckCircle2 className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{ticket.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-muted-foreground">{ticket.location} • <span className="text-xs">{ticket.time}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs text-slate-500 dark:text-muted-foreground bg-slate-50 dark:bg-black/30 px-2 py-1 rounded">
                                        {ticket.id}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-1 rounded-full",
                                        ticket.priority === 'High' ? "bg-red-500/20 text-red-400" :
                                            ticket.priority === 'Medium' ? "bg-orange-500/20 text-orange-400" :
                                                "bg-cyan-500/20 text-cyan-400"
                                    )}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Equipment Health Status */}
                <div className="glass-card p-6 rounded-2xl h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">État du Parc Matériel</h3>

                    <div className="space-y-6">
                        {/* Sensors */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-900 dark:text-white font-medium">Capteurs IoT (Sondes)</span>
                                <span className="text-emerald-400">98% Opérationnels</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: '98%' }}></div>
                            </div>
                        </div>

                        {/* HVAC */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-900 dark:text-white font-medium">Systèmes CVC</span>
                                <span className="text-orange-400">85% Opérationnels</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">1 unité nécessite une révision (Open Space).</p>
                        </div>

                        {/* Gateways */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-900 dark:text-white font-medium">Gateways MQTT</span>
                                <span className="text-emerald-400">100% Opérationnels</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Prochaine Maintenance Proch.</h4>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Dans 14 jours (Inspection Annuelle)
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
