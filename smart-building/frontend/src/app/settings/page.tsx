"use client";

import { Settings, User, Bell, Network, Shield, Users, Clock, Palette, Webhook, Plus, Mail, Trash2, Key, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTenant } from "@/lib/TenantContext";

export default function SettingsPage() {
    const { currentTenant, authFetch } = useTenant();
    const isAdmin = currentTenant?.role === "SUPER_ADMIN";
    const [activeTab, setActiveTab] = useState("system");

    // Notification states
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);
    const [pushAlerts, setPushAlerts] = useState(true);

    // System states
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Appearance states
    const [themeColor, setThemeColor] = useState("emerald");

    // Schedule states
    const [workStart, setWorkStart] = useState("08:00");
    const [workEnd, setWorkEnd] = useState("19:00");

    // Users states
    const [usersList, setUsersList] = useState<any[]>([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "CLIENT", password: "password123" });

    const fetchUsers = async () => {
        try {
            const res = await authFetch("http://localhost:3001/api/users");
            if (res.ok) {
                setUsersList(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authFetch("http://localhost:3001/api/users", {
                method: "POST",
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                setIsInviteModalOpen(false);
                setNewUser({ name: "", email: "", role: "CLIENT", password: "password123" });
                await fetchUsers();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Retirer l'accès à ${name} ?`)) return;
        try {
            const res = await authFetch(`http://localhost:3001/api/users/${id}`, { method: "DELETE" });
            if (res.ok) await fetchUsers();
        } catch (e) { console.error(e); }
    };

    const tabs = [
        { id: "system", label: "Système", icon: Settings },
        { id: "users", label: "Utilisateurs", icon: Users },
        { id: "planning", label: "Horaires Prédéfinis", icon: Clock },
        { id: "appearance", label: "Marque Blanche", icon: Palette },
        { id: "integrations", label: "API & Webhooks", icon: Webhook },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "network", label: "Réseau & MQTT", icon: Network },
        { id: "security", label: "Sécurité", icon: Shield },
    ];

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pt-4 pb-12">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-white/5 pb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                    <Settings className="h-8 w-8 text-primary mr-3" />
                    Paramètres Avancés
                </h1>
                <p className="text-slate-500 dark:text-muted-foreground font-medium">Gestion fine de la plateforme, utilisateurs, et intégrations avec le SI.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 flex flex-col gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all text-left group",
                                activeTab === tab.id
                                    ? "bg-primary text-slate-900 dark:text-white shadow-md shadow-primary/20"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4 mr-3 transition-colors", activeTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-primary")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 glass-card p-8 rounded-2xl min-h-[600px] border-slate-200 dark:border-white/5 animate-in fade-in zoom-in-95 duration-300">

                    {activeTab === "system" && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Paramètres Système</h2>

                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white mb-1">Nom de l'Espace</label>
                                    <input
                                        type="text"
                                        defaultValue={currentTenant?.name || "SmartBuild GTB"}
                                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white mb-1">Fuseau Horaire de Référence</label>
                                    <select className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 text-sm font-medium">
                                        <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                                        <option value="UTC">UTC Globale</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Sert de base de calcul pour la fermeture des bâtiments.</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 mt-6">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-bold flex items-center">
                                            Mode Maintenance
                                            {maintenanceMode && <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase rounded-full border border-orange-500/20">Actif</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">Désactive l'accès aux utilisateurs standards et suspend les alertes sortantes.</p>
                                    </div>
                                    <div
                                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                                        className={cn("w-12 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner", maintenanceMode ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-700")}>
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", maintenanceMode ? "translate-x-7" : "translate-x-1")}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button className="bg-primary text-slate-900 dark:text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
                                    Sauvegarder les modifications
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gestion des Accès (Globaux)</h2>
                                    <p className="text-sm text-slate-500">Collaborateurs ayant accès au tableau de bord.</p>
                                </div>
                                <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-primary/20">
                                    <Mail className="w-4 h-4" /> Inviter
                                </button>
                            </div>

                            <div className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-black/20">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-black/40 dark:text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Utilisateur</th>
                                            <th className="px-4 py-3 font-bold">Rôle</th>
                                            <th className="px-4 py-3 font-bold">Statut</th>
                                            <th className="px-4 py-3 text-right font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map((usr: any) => (
                                            <tr key={usr.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-900 dark:text-white">{usr.name}</div>
                                                    <div className="text-xs opacity-70"><a href={`mailto:${usr.email}`} className="hover:text-primary">{usr.email}</a></div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "px-2 py-1 font-bold rounded text-[10px] uppercase tracking-wider",
                                                        usr.role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600" :
                                                            usr.role === "ENERGY_MANAGER" ? "bg-orange-500/10 text-orange-600" :
                                                                "bg-emerald-500/10 text-emerald-600"
                                                    )}>
                                                        {usr.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-emerald-500 font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Actif</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDeleteUser(usr.id, usr.name)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4 ml-auto" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersList.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">Aucun utilisateur trouvé.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "planning" && (
                        <div className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Horaires d'Ouverture du Bâtiment</h2>
                            <p className="text-sm text-slate-500">Ces plages horaires permettent de basculer tous les équipements CVC (Chauffage, Ventilation, Climatisation) et éclairages en mode "Éco" automatiquement hors des heures d'ouverture.</p>

                            <div className="space-y-4 pt-4">
                                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map(day => (
                                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                        <span className="font-bold text-slate-900 dark:text-white mb-2 sm:mb-0 w-32">{day}</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Ouverture</span>
                                                <input type="time" defaultValue="08:00" className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded px-3 py-1.5 text-sm font-bold w-28 text-slate-900 dark:text-white" />
                                            </div>
                                            <span className="text-slate-400 mt-4">-</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Fermeture</span>
                                                <input type="time" defaultValue="19:00" className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded px-3 py-1.5 text-sm font-bold w-28 text-slate-900 dark:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                    <span className="font-bold text-orange-600 dark:text-orange-400">Samedi & Dimanche</span>
                                    <span className="font-bold text-orange-600/70 dark:text-orange-400/70 text-sm">Mode ÉCO Continu H24</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Identité Visuelle (Marque Blanche)</h2>
                            <p className="text-sm text-slate-500">Personnalisez le rendu visuel de la plateforme pour qu'elle corresponde à votre charte graphique.</p>

                            <div className="space-y-8 pt-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-900 dark:text-white mb-3 block">Couleur Primaire (Thème)</label>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'emerald', color: 'bg-emerald-500' },
                                            { id: 'blue', color: 'bg-blue-500' },
                                            { id: 'purple', color: 'bg-purple-500' },
                                            { id: 'orange', color: 'bg-orange-500' },
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setThemeColor(theme.id)}
                                                className={cn("w-12 h-12 rounded-full ring-offset-2 dark:ring-offset-slate-900 transition-all", theme.color, themeColor === theme.id ? "ring-2 ring-primary scale-110 shadow-lg" : "scale-100 opacity-50 hover:opacity-100")}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-slate-900 dark:text-white mb-3">Logo de l'Entreprise</label>
                                    <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-black/40 transition-colors cursor-pointer group">
                                        <Palette className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors mb-3" />
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Cliquez ou glissez une image (PNG/SVG, 400x100px max)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "integrations" && (
                        <div className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">API & Webhooks B2B</h2>
                            <p className="text-sm text-slate-500">Connectez vos propres systèmes internes (ERP, Jira, ServiceNow) pour réagir aux évènements de la GMAO.</p>

                            <div className="space-y-6 pt-4">
                                <div className="glass-card bg-slate-50/50 dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px] -mr-8 -mt-8 pointer-events-none"></div>
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-1">
                                        <Key className="w-4 h-4 mr-2 text-primary" />
                                        Clé d'API (Read-Only)
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4">Utilisée pour aspirer la data brute depuis vos scripts (PowerBI, Python).</p>

                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 py-2 px-3 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 overflow-hidden text-ellipsis">sk_live_9f8d7c6b5a4...</code>
                                        <button className="bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-bold px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">Copier</button>
                                        <button className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-4 rounded-lg hover:bg-primary hover:text-white transition-colors">Renouveler la clé</button>
                                    </div>
                                </div>

                                <div className="glass-card bg-slate-50/50 dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-1">
                                                <Webhook className="w-4 h-4 mr-2 text-primary" />
                                                Webhooks "Création d'Alerte"
                                            </h3>
                                            <p className="text-xs text-slate-500">POST Request envoyé lors d'un défaut matériel critique (CVC hors ligne).</p>
                                        </div>
                                        <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                                            <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-500">URL du point d'entrée (Payload JSON)</label>
                                        <input
                                            type="url"
                                            defaultValue="https://api.votre-erp.com/webhooks/smartbuild/alerts"
                                            className="bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 py-2 px-3 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex gap-2">
                                        <button className="text-xs bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-bold">Voir un exemple de Payload</button>
                                        <button className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded font-bold">Tester la requête (Ping)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4 flex items-center">
                                Préférences d'Alertes
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">
                                Choisissez comment le système doit vous contacter lorsqu'une règle domotique lève une alerte.
                            </p>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-bold flex items-center"><Mail className="w-4 h-4 mr-2" /> Rapport d'Incident Quotidien (Email)</h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">Résumé des alertes non-traitées envoyé à 8h00.</p>
                                    </div>
                                    <div
                                        className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner", emailAlerts ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}
                                        onClick={() => setEmailAlerts(!emailAlerts)}
                                    >
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", emailAlerts ? "translate-x-6" : "translate-x-1")}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-bold flex items-center">Alertes Temps Réel SMS (Critique uniquement)</h4>
                                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">Notification immédiate pour interventions d'urgence.</p>
                                    </div>
                                    <div
                                        className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner", smsAlerts ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}
                                        onClick={() => setSmsAlerts(!smsAlerts)}
                                    >
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", smsAlerts ? "translate-x-6" : "translate-x-1")}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {["network", "security"].includes(activeTab) && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-muted-foreground space-y-4 py-20">
                            <LockIcon tab={activeTab} />
                            <p className="text-sm font-bold text-orange-500/70 py-1 px-4 border border-orange-500/20 bg-orange-500/10 rounded-full">Zone restreinte par UBBEE Infrastructures</p>
                            <p className="text-sm text-center max-w-sm">La gestion du réseau MQTT IoT et des protocoles de sécurité avancée et cryptage SSL sont gérés directement par nos équipes infogérance.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Invite Global User */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
                        <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="h-5 w-5" /></button>
                        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white flex items-center"><Mail className="w-5 h-5 mr-2 text-primary" /> Inviter un Utilisateur (Global)</h2>
                        <p className="text-xs text-slate-500 mb-6">Cet utilisateur aura des accès transversaux (sans assignation de client spécifique).</p>

                        <form onSubmit={handleInviteUser} className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom Complet</label>
                                <input type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-primary outline-none transition-all placeholder-slate-400" placeholder="ex: Admin UBBEE" />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Adresse Email</label>
                                <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-primary outline-none transition-all placeholder-slate-400" placeholder="admin@ubbee.fr" />
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <label className="text-sm font-bold text-slate-900 dark:text-white mb-3 block">Délégation de Droits & Rôle</label>
                                <div className="space-y-3">
                                    <label className="flex items-start cursor-pointer group">
                                        <input type="radio" name="role" value="ENERGY_MANAGER" checked={newUser.role === 'ENERGY_MANAGER'} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="mt-1 mr-3 text-orange-500 focus:ring-orange-500" />
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-orange-500 transition-colors">Energy Manager (Niveau 2)</span>
                                            <span className="text-xs text-slate-500">Alerte, création de règles, gestion locative de tous les prestataires.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start cursor-pointer group">
                                        <input type="radio" name="role" value="SUPER_ADMIN" checked={newUser.role === 'SUPER_ADMIN'} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="mt-1 mr-3 text-purple-500 focus:ring-purple-500" />
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-purple-500 transition-colors">Super Administrateur</span>
                                            <span className="text-xs text-slate-500">Accès total au système, facturation, serveurs MQTT et API Webhooks.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 mt-6 bg-primary hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex justify-center items-center">
                                Envoyer l'invitation globale
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function LockIcon({ tab }: { tab: string }) {
    if (tab === "network") return <Network className="h-16 w-16 opacity-20" />;
    return <Shield className="h-16 w-16 opacity-20" />;
}
