"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Plus, Filter, MoreVertical, MapPin, Building, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

// Types
interface Site {
    id: string;
    name: string;
    type?: string;
    address: string;
    city: string;
    status: string;
    zonesCount?: number;
}

export default function SitesListPage() {
    const router = useRouter();
    const { authFetch, currentTenant } = useTenant();
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const isAdmin = currentTenant?.role === "ENERGY_MANAGER" || currentTenant?.role === "SUPER_ADMIN";

    const fetchSites = async () => {
        setLoading(true);
        try {
            const res = await authFetch("http://localhost:3001/api/sites");
            if (res.ok) {
                const data = await res.json();
                const processedSites = data.map((d: any) => ({
                    ...d,
                    zonesCount: d.zones ? d.zones.length : 0
                }));
                setSites(processedSites);
            }
        } catch (err) {
            console.error("Failed to fetch sites", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSites();
    }, [authFetch, currentTenant?.id]);

    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2 flex items-center">
                        <Building2 className="h-8 w-8 text-primary mr-3" />
                        Annuaire des Sites (Parc)
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">Consultez et recherchez parmi tous les bâtiments de votre infrastructure.</p>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/clients')} className="bg-primary hover:bg-emerald-400 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center transition-all">
                            <Plus className="w-5 h-5 mr-2" />
                            Créer (via un Client)
                        </button>
                    </div>
                )}
            </div>

            {/* Sites Table */}
            <div className="glass-card rounded-2xl overflow-hidden border-slate-200 dark:border-white/5 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Liste des Bâtiments</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Rechercher (nom, ville)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-primary/50 text-sm text-slate-900 dark:text-white rounded-lg pl-9 pr-4 py-2 outline-none w-48 sm:w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-black/20 text-[11px] uppercase tracking-wider text-slate-500 dark:text-muted-foreground/80 border-b border-slate-200 dark:border-white/5">
                                <th className="px-6 py-4 font-semibold">Nom du Site</th>
                                <th className="px-6 py-4 font-semibold text-center">Type</th>
                                <th className="px-6 py-4 font-semibold text-center">Localisation</th>
                                <th className="px-6 py-4 font-semibold text-center">Zones Actives</th>
                                <th className="px-6 py-4 font-semibold text-center">Statut</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-muted-foreground animate-pulse">
                                        Chargement des sites...
                                    </td>
                                </tr>
                            ) : filteredSites.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-muted-foreground">
                                        Aucun site ne correspond à votre recherche.
                                    </td>
                                </tr>
                            ) : (
                                filteredSites.map((site) => (
                                    <tr key={site.id} className="bg-white/50 dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-white/10 mr-4 group-hover:border-primary/40 transition-colors">
                                                    <Building className="h-5 w-5 text-slate-500 dark:text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{site.name}</p>
                                                    <p className="text-[10px] uppercase text-slate-500 dark:text-muted-foreground mt-0.5 tracking-widest">{site.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                                {site.type || "Bureaux"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center flex justify-center items-center">
                                            <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                                            <span className="font-bold text-slate-900 dark:text-white">{site.city}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <Activity className="h-4 w-4 text-emerald-400 mr-2" />
                                                <span className="font-bold text-slate-900 dark:text-white">{site.zonesCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                                Connecté
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`/sites/${site.id}`} className="px-4 py-2 text-xs font-bold text-slate-900 dark:text-white bg-primary hover:bg-emerald-400 rounded-lg transition-colors shadow-sm inline-block">
                                                Accéder au site
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
