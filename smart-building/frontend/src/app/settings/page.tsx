"use client";

import { Settings, User, Bell, Network, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    // Notification states
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);
    const [pushAlerts, setPushAlerts] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const tabs = [
        { id: "system", label: "Système", icon: Settings },
        { id: "profile", label: "Profil", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "network", label: "Réseau & MQTT", icon: Network },
        { id: "security", label: "Sécurité", icon: Shield },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                    <Settings className="h-8 w-8 text-primary mr-3" />
                    Paramètres Système
                </h1>
                <p className="text-slate-500 dark:text-muted-foreground">Configuration de l'application et préférences de l'utilisateur.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 glass-card p-4 rounded-2xl h-fit">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                                    activeTab === tab.id
                                        ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                                        : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:bg-white/5 hover:text-slate-900 dark:text-white"
                                )}
                            >
                                <tab.icon className="h-4 w-4 mr-3" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 glass-card p-8 rounded-2xl min-h-[500px]">
                    {activeTab === "system" && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Paramètres Système</h2>

                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white mb-1">Nom du Plateforme</label>
                                    <input
                                        type="text"
                                        defaultValue="SmartBuild GTB"
                                        className="bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white mb-1">Fuseau Horaire</label>
                                    <select className="bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 appearance-none">
                                        <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 mt-6">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-medium">Mode Sombre</h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground">Appliquer le thème sombre par défaut sur tous les écrans</p>
                                    </div>
                                    <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 mt-6">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-medium flex items-center">
                                            Status de Plateforme
                                            {maintenanceMode && <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase rounded-full border border-orange-500/20">Maintenance</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground">Activer le mode maintenance pour restreindre l'accès client</p>
                                    </div>
                                    <div
                                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                                        className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors shadow-[0_0_8px_rgba(6,182,212,0.1)]", maintenanceMode ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-700")}>
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", maintenanceMode ? "translate-x-6" : "translate-x-1")}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">
                                    Sauvegarder les modifications
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "network" && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Configuration MQTT</h2>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Connectez le dashboard au broker IoT pour recevoir les flux de données brutes.</p>

                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white mb-1">Adresse du Broker</label>
                                    <input
                                        type="text"
                                        defaultValue="mqtt://localhost"
                                        disabled
                                        className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-4 py-2 text-slate-500 dark:text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white mb-1">Port</label>
                                    <input
                                        type="text"
                                        defaultValue="1883"
                                        disabled
                                        className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-4 py-2 text-slate-500 dark:text-muted-foreground cursor-not-allowed"
                                    />
                                </div>

                                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start">
                                    <Shield className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                                    <p className="text-sm text-orange-200">
                                        La modification des paramètres réseau est actuellement bloquée par l'administrateur système (Raison: Mode Simulation Actif).
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4 flex items-center">
                                <Bell className="h-5 w-5 mr-3 text-primary" />
                                Préférences d'Alertes
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">
                                Choisissez comment le système doit vous contacter lorsqu'une règle domotique lève une alerte critique (ex. dépasssement de seuil, perte réseau).
                            </p>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-medium">Alertes par Email</h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">Envoi d'un rapport détaillé pour chaque incident</p>
                                    </div>
                                    <div
                                        className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors", emailAlerts ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700")}
                                        onClick={() => setEmailAlerts(!emailAlerts)}
                                    >
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", emailAlerts ? "translate-x-6" : "translate-x-1")}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-medium">Alertes par SMS</h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">Notification immédiate pour interventions d'urgence</p>
                                    </div>
                                    <div
                                        className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors", smsAlerts ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700")}
                                        onClick={() => setSmsAlerts(!smsAlerts)}
                                    >
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", smsAlerts ? "translate-x-6" : "translate-x-1")}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-medium">Push In-App (Navigateur)</h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">Notifications sonores lorsque le cockpit est ouvert</p>
                                    </div>
                                    <div
                                        className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors", pushAlerts ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700")}
                                        onClick={() => setPushAlerts(!pushAlerts)}
                                    >
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", pushAlerts ? "translate-x-6" : "translate-x-1")}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all">
                                    Enregistrer les préférences
                                </button>
                            </div>
                        </div>
                    )}

                    {["profile", "security"].includes(activeTab) && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-muted-foreground space-y-4">
                            <Settings className="h-12 w-12 opacity-20 animate-[spin_10s_linear_infinite]" />
                            <p>Ce module est en cours de développement.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
