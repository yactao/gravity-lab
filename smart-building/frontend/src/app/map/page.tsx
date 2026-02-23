"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { SitesMap } from "@/components/dashboard/SitesMap";
import { MapPin, Maximize2, Minimize2, ActivitySquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

export default function MapPage() {
    const { authFetch } = useTenant();
    const [sites, setSites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Map Filters
    const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>("");
    const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sitesRes = await authFetch("http://localhost:3001/api/sites");
                if (sitesRes.ok) setSites(await sitesRes.json());
            } catch (err) {
                console.error("Failed to fetch sites", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Setup WebSocket for realtime refresh
        const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "");

        socket.on("connect", () => {
            console.log("WebSocket connected for Realtime IoT Data (Map)");
        });

        socket.on("refresh_data", () => {
            console.log("Map Realtime update received! Refreshing global map data...");
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, [authFetch]);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4 h-[calc(100vh-8rem)] flex flex-col">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                    <div className="flex items-center text-slate-900 dark:text-white mb-2">
                        <MapPin className="h-8 w-8 mr-3 text-primary" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                            Cartographie Globale
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">
                        Vue géographique et localisation de l'ensemble de vos sites équipés.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <select
                        value={selectedSiteFilter}
                        onChange={e => { setSelectedSiteFilter(e.target.value); setSelectedZoneFilter(""); }}
                        className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary backdrop-blur-md"
                    >
                        <option value="">Tous les sites</option>
                        {sites.map(site => (
                            <option key={site.id} value={site.id}>{site.name} ({site.city})</option>
                        ))}
                    </select>
                    <select
                        value={selectedZoneFilter}
                        onChange={e => setSelectedZoneFilter(e.target.value)}
                        disabled={!selectedSiteFilter}
                        className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary backdrop-blur-md disabled:opacity-50"
                    >
                        <option value="">Toutes les zones</option>
                        {selectedSiteFilter && sites.find(s => s.id === selectedSiteFilter)?.zones?.map((zone: any) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Map Container */}
            <div className="flex-1 glass-card p-2 rounded-2xl flex flex-col relative overflow-hidden border-slate-200 dark:border-white/5 shadow-lg">
                <div className="flex-1 w-full relative z-0 rounded-xl overflow-hidden pointer-events-auto">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-black/20">
                            <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
                        </div>
                    ) : (
                        <SitesMap sites={selectedSiteFilter ? sites.filter(s => s.id === selectedSiteFilter) : sites} />
                    )}
                </div>
            </div>
        </div>
    );
}
