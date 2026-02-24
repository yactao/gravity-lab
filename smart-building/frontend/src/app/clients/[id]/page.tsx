"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTenant } from "@/lib/TenantContext";
import { Briefcase, Activity, Users, Settings, ArrowLeft, Building2, Plus, MapPin, Building, X } from "lucide-react";
import { BuildingModel } from "@/components/dashboard/BuildingModel";

export default function ClientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { authFetch, currentTenant } = useTenant();
    const clientId = params.id as string;

    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("infos"); // infos, dashboard, users

    // Add Site states
    const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
    const [newSite, setNewSite] = useState({ name: "", type: "Bureaux", address: "", city: "" });
    const isAdmin = currentTenant?.role === "ENERGY_MANAGER" || currentTenant?.role === "SUPER_ADMIN";

    const fetchClientDetails = async () => {
        try {
            const res = await authFetch(`http://localhost:3001/api/organizations`);
            if (res.ok) {
                const data = await res.json();
                const found = data.find((org: any) => org.id === clientId);
                setClient(found);
            }
        } catch (err) {
            console.error("Failed to fetch client details", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientDetails();
    }, [clientId, authFetch]);

    const handleCreateSite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...newSite };

            const res = await authFetch("http://localhost:3001/api/sites", {
                method: "POST",
                headers: { "x-organization-id": clientId },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsAddSiteOpen(false);
                setNewSite({ name: "", type: "Bureaux", address: "", city: "" });
                await fetchClientDetails(); // Reload to get the new site
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Chargement des données du client...</div>;
    if (!client) return <div className="p-8 text-center text-rose-500">Client introuvable.</div>;

    const tabs = [
        { id: "infos", title: "Informations & Sites", icon: Building2 },
        { id: "dashboard", title: "Tableau de Bord Client", icon: Activity },
        { id: "users", title: "Gestion Utilisateurs", icon: Users },
    ];

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6">
                <div>
                    <button
                        onClick={() => router.push('/clients')}
                        className="flex items-center text-xs font-bold text-slate-500 hover:text-primary mb-3 transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" /> Retour à la liste
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent flex items-center">
                        <Briefcase className="h-8 w-8 text-primary mr-3" />
                        {client.name}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground mt-1">
                        Secteur : {client.type} | ID : {client.id.split('-')[0]}
                    </p>
                </div>
            </div>

            {/* Custom Tabs Navigation */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-white/10 pb-0 overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-5 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* Main Content Area based on activeTab */}
            <div className="pt-4">

                {/* 1. INFORMATIONS & SITES */}
                {activeTab === "infos" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Details Card */}
                        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border-slate-200 dark:border-white/5 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">Coordonnées</h3>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Adresse</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-300">{client.address || "Non renseignée"}</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-300">{client.city}, {client.country}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Contact</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-300">{client.phone || "N/A"}</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-300">{client.email || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Informations légales</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-300">Forme juridique: {client.legalForm || "N/A"}</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-300">Date création: {client.establishmentDate || "N/A"}</p>
                            </div>
                        </div>

                        {/* Sites & Synoptique */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Sites List Summary */}
                            <div className="glass-card p-6 rounded-2xl border-slate-200 dark:border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sites rattachés (Gestion Parc)</h3>
                                    {isAdmin && (
                                        <button onClick={() => setIsAddSiteOpen(true)} className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all flex items-center">
                                            <Plus className="h-3 w-3 mr-1" />
                                            Nouveau Site
                                        </button>
                                    )}
                                </div>

                                {client.sites && client.sites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                                        {client.sites.map((site: any) => (
                                            <div key={site.id}
                                                onClick={() => router.push(`/sites/${site.id}`)}
                                                className="p-3 bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer transition-colors group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-sm flex items-center">
                                                        <Building className="h-3 w-3 mr-1.5" />
                                                        {site.name}
                                                    </h4>
                                                    <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">Actif</span>
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center"><MapPin className="h-3 w-3 mr-1" /> {site.city}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 mb-4 p-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                                        Aucun site n'est encore configuré pour ce client.
                                    </p>
                                )}
                            </div>

                            {/* Jumeau Numérique / Synoptique */}
                            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center border-slate-200 dark:border-white/5 relative h-[400px]">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white w-full absolute top-5 left-5 z-10">Jumeau Numérique (Synoptique Mode)</h3>
                                <p className="text-xs text-slate-500 w-full absolute top-11 left-5 z-10">Aperçu 3D représentatif des infrastructures de {client.name}</p>
                                <div className="w-full h-full pointer-events-auto">
                                    <BuildingModel temperature={22} co2={450} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TABLEAU DE BORD CLIENT */}
                {activeTab === "dashboard" && (
                    <div className="glass-card p-12 text-center rounded-2xl border-slate-200 dark:border-white/5">
                        <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tableau de Bord Consolidé</h3>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">
                            Cette section regroupera les KPIS consolidés de tous les sites du client {client.name} (consommation totale, alertes cumulées, etc.).
                        </p>
                    </div>
                )}

                {/* 3. GESTION UTILISATEURS */}
                {activeTab === "users" && (
                    <div className="glass-card p-12 text-center rounded-2xl border-slate-200 dark:border-white/5">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Comptes Utilisateurs ({client.usersCount})</h3>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">
                            Gérez les accès, les rôles (CLIENT, ENERGY_MANAGER) et les mots de passe des collaborateurs de {client.name}.
                        </p>
                    </div>
                )}

            </div>

            {/* Modal: Add Site */}
            {isAddSiteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
                        <button onClick={() => setIsAddSiteOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="h-5 w-5" /></button>
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Ajouter un Site à {client.name}</h2>
                        <form onSubmit={handleCreateSite} className="space-y-4">
                            <div><label className="text-sm text-slate-500 dark:text-slate-400">Nom du bâtiment</label>
                                <input type="text" required value={newSite.name} onChange={e => setNewSite({ ...newSite, name: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white" /></div>

                            <div><label className="text-sm text-slate-500 dark:text-slate-400">Type</label>
                                <select value={newSite.type} onChange={e => setNewSite({ ...newSite, type: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white">
                                    <option value="Bureaux">Bureaux</option><option value="Magasin">Magasin</option><option value="Usine">Usine</option><option value="Logistique">Logistique</option>
                                </select></div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm text-slate-500 dark:text-slate-400">Adresse</label>
                                    <input type="text" required value={newSite.address} onChange={e => setNewSite({ ...newSite, address: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white" /></div>
                                <div><label className="text-sm text-slate-500 dark:text-slate-400">Ville</label>
                                    <input type="text" required value={newSite.city} onChange={e => setNewSite({ ...newSite, city: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white" /></div>
                            </div>

                            <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-emerald-400 text-slate-900 dark:text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">Créer le Bâtiment</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
