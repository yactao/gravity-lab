"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Building2, Layers, ThermometerSun, Wind, Users, Activity, ChevronsUpDown, Cpu, Search, CheckCircle2, ChevronDown, ChevronRight, Building, MapPin, LayoutGrid, Thermometer, Plus, X, Zap, ArrowLeft, Sun, CloudRain, AlertTriangle, ShieldCheck, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { StatsCard } from "@/components/dashboard/StatsCard";

// Types
interface Sensor {
    id: string;
    name: string;
    type: string;
}

interface Zone {
    id: string;
    name: string;
    floor: string;
    type?: string;
    sensors?: Sensor[];
}

interface Site {
    id: string;
    name: string;
    type?: string;
    address: string;
    city: string;
    status: string;
    zones: Zone[];
}

export default function SiteDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.id as string;
    const { authFetch, currentTenant } = useTenant();

    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});

    // Tab and Table States
    const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "equipements"
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Mock Data for site dashboard
    const [siteEnergyData] = useState<any[]>([
        { time: "00:00", value: 450, cvc: 300 },
        { time: "04:00", value: 420, cvc: 280 },
        { time: "08:00", value: 1200, cvc: 800 },
        { time: "12:00", value: 3500, cvc: 2100 },
        { time: "16:00", value: 3200, cvc: 1900 },
        { time: "20:00", value: 1500, cvc: 900 },
        { time: "23:59", value: 600, cvc: 350 },
    ]);
    const [alerts] = useState([
        { id: 1, type: "error", message: "Code Erreur CVC: EXT-01 (Groupe Froid)", time: "Il y a 10 min" },
        { id: 2, type: "warning", message: "Capteur CO2 Salle Réunion Offline", time: "Il y a 2h" }
    ]);
    const [rules] = useState([
        { id: 1, message: "Règle activée: Baisse consigne CVC (-2°C) suite à dlcissement Tarif", time: "08:30" },
        { id: 2, message: "Règle activée: Extinction éclairage oublié RDC", time: "20:15 hier" }
    ]);

    // Modales states
    const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
    const [newZone, setNewZone] = useState({ name: "", type: "Office", floor: "RDC" });
    const isAdmin = currentTenant?.role === "ENERGY_MANAGER" || currentTenant?.role === "SUPER_ADMIN";

    const fetchSiteDetails = async (isSilentRefresh = false) => {
        if (!isSilentRefresh) setLoading(true);
        try {
            // Fetch all sites for now and find. Ideally GET /api/sites/:id
            const res = await authFetch("http://localhost:3001/api/sites");
            if (res.ok) {
                const data = await res.json();
                const found = data.find((s: any) => s.id === siteId);
                setSite(found || null);
                // Auto-expand first floor if exists and it's the initial load
                if (found && found.zones && found.zones.length > 0 && !isSilentRefresh) {
                    const firstFloor = found.zones[0].floor || "RDC";
                    setExpandedFloors(prev => Object.keys(prev).length === 0 ? { [firstFloor]: true } : prev);
                }
            }
        } catch (err) {
            console.error("Failed to fetch site", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSiteDetails();

        // Setup WebSocket for realtime refresh
        const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "");

        socket.on("connect", () => {
            console.log("WebSocket connected for Realtime IoT Data");
        });

        socket.on("refresh_data", (data: any) => {
            // If it's a global refresh or specifically for our site
            if (data.all || data.siteId === siteId) {
                console.log("Realtime update received! Refreshing site data...");
                fetchSiteDetails(true); // Silent refresh, no loading spinner
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [siteId, authFetch]);

    const handleCreateZone = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authFetch("http://localhost:3001/api/zones", {
                method: "POST",
                body: JSON.stringify({ ...newZone, siteId: siteId })
            });
            if (res.ok) {
                setIsAddZoneOpen(false);
                setNewZone({ name: "", type: "Office", floor: "RDC" });
                await fetchSiteDetails();
                if (newZone.floor) setExpandedFloors(prev => ({ ...prev, [newZone.floor]: true }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Chargement du site...</div>;
    if (!site) return <div className="p-12 text-center text-rose-500">Site introuvable.</div>;

    // Group zones by floor
    const zonesByFloor = site.zones?.reduce((acc: Record<string, Zone[]>, zone: Zone) => {
        const floor = zone.floor || "RDC";
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(zone);
        return acc;
    }, {}) || {};

    const toggleFloor = (floor: string) => {
        setExpandedFloors(prev => ({ ...prev, [floor]: !prev[floor] }));
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-slate-200 dark:border-white/5">
                <div>
                    <button
                        onClick={() => router.push('/sites')}
                        className="flex items-center text-xs font-bold text-slate-500 hover:text-primary mb-3 transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" /> Retour à l'annuaire des sites
                    </button>
                    <div className="flex items-center text-slate-900 dark:text-white mb-2">
                        <Building2 className="h-8 w-8 mr-3 text-primary" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                            {site.name}
                        </h1>
                        <span className="ml-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                            {site.type || "Bureaux"}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                        {site.address}, {site.city}
                    </p>
                </div>

                <div className="flex gap-4">
                    {/* Météo Widget Site */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                        <Sun className="h-6 w-6 text-yellow-400" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-tight">Météo Locale</p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">19°C {site.city}</h4>
                        </div>
                    </div>
                    {/* Health Score Site */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        <div>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest leading-tight">Santé Site</p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">95/100</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 border-b border-slate-200 dark:border-white/10 mb-6 px-2 overflow-x-auto custom-scrollbar">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={cn(
                        "pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all",
                        activeTab === 'dashboard' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    )}
                >
                    Tableau de Bord
                </button>
                <button
                    onClick={() => setActiveTab('equipements')}
                    className={cn(
                        "pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all",
                        activeTab === 'equipements' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    )}
                >
                    Équipements
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <>
                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard title="Conso. Globale (Live)" value="3,500 W" trend="+5%" trendUp={false} icon={Zap} color="cyan" />
                        <StatsCard title="Conso. CVC (Live)" value="2,100 W" trend="-2%" trendUp={true} icon={ThermometerSun} color="orange" />
                        <StatsCard title="Qualité Air Moyenne" value="480 ppm" trend="Excellent" trendUp={true} icon={Wind} color="green" />
                        <StatsCard title="Zones Connectées" value={site.zones?.length?.toString() || "0"} trend="Global: OK" trendUp={true} icon={Activity} color="purple" />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: Energy Charts (Span 2) */}
                        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border-slate-200 dark:border-white/5 flex flex-col h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyse des Consommations</h3>
                                    <p className="text-xs text-slate-500 dark:text-muted-foreground">Comparaison Globale vs Système CVC</p>
                                </div>
                                <div className="flex space-x-2">
                                    <span className="flex items-center text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">Globale</span>
                                    <span className="flex items-center text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">CVC</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full bg-slate-50 dark:bg-black/20 rounded-xl p-4 flex flex-col border border-slate-100 dark:border-white/5 relative h-64">
                                <EnergyChart data={siteEnergyData} />
                            </div>
                        </div>

                        {/* Right: Feeds (Errors & Rules) */}
                        <div className="lg:col-span-1 flex flex-col gap-4">
                            {/* Alerts Feed */}
                            <div className="glass-card p-5 rounded-2xl flex-1 border-slate-200 dark:border-white/5 flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-4">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-rose-500" />
                                    Anomalies du site
                                </h3>
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {alerts.map(a => (
                                        <div key={a.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{a.message}</p>
                                            <p className="text-[10px] text-slate-500">{a.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rules Feed */}
                            <div className="glass-card p-5 rounded-2xl flex-1 border-slate-200 dark:border-white/5 flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-4">
                                    <Cpu className="h-4 w-4 mr-2 text-primary" />
                                    Historique des Règles
                                </h3>
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {rules.map(r => (
                                        <div key={r.id} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{r.message}</p>
                                            <p className="text-[10px] text-slate-500">{r.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Locaux / Zones (Arborescence) */}
                    <div className="glass-card rounded-2xl p-6 border-slate-200 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                                    <Layers className="h-5 w-5 mr-2 text-primary" />
                                    Arborescence Technique (Locaux)
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Gérez les zones virtuelles et les capteurs affectés à ce bâtiment.</p>
                            </div>
                            {isAdmin && (
                                <button onClick={() => setIsAddZoneOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold rounded-xl transition-all shadow-sm flex items-center text-sm">
                                    <Plus className="h-4 w-4 mr-2 text-emerald-500" /> Ajouter Zone
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {Object.keys(zonesByFloor).length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-muted-foreground border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                                    <LayoutGrid className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-sm">Aucune zone configurée pour ce bâtiment.</p>
                                </div>
                            ) : (
                                Object.entries(zonesByFloor).sort().map(([floor, zones]) => (
                                    <div key={floor} className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                                        {/* Floor Header */}
                                        <button
                                            onClick={() => toggleFloor(floor)}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{floor}</span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Niveau</h3>
                                                <span className="ml-4 px-2.5 py-1 bg-slate-200 dark:bg-black/40 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-inner">{zones.length} Zones</span>
                                            </div>
                                            {expandedFloors[floor] ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
                                        </button>

                                        {/* Zones Grid */}
                                        {expandedFloors[floor] && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-black/20">
                                                {zones.map(zone => (
                                                    <div key={zone.id} className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10 hover:border-primary/40 transition-all group">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">{zone.name}</h4>
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{zone.type}</span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                                            <div className="bg-white dark:bg-white/5 p-2 rounded-lg flex flex-col justify-center border border-slate-100 dark:border-white/5 shadow-sm">
                                                                <span className="text-[9px] text-slate-500 uppercase mb-0.5">Climat</span>
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center"><Thermometer className="h-3 w-3 text-orange-400 mr-1" /> 22.5°C</span>
                                                            </div>
                                                            <div className="bg-white dark:bg-white/5 p-2 rounded-lg flex flex-col justify-center border border-slate-100 dark:border-white/5 shadow-sm">
                                                                <span className="text-[9px] text-slate-500 uppercase mb-0.5">Présence</span>
                                                                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center"><Users className="h-3 w-3 mr-1" /> Oui</span>
                                                            </div>
                                                        </div>
                                                        <button className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors group-hover:bg-primary group-hover:text-white">
                                                            Détails Capteurs
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'equipements' && (
                <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm bg-white dark:bg-transparent">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher"
                                className="pl-9 pr-4 py-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary w-64 text-slate-900 dark:text-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-primary hover:border-primary/50 transition-colors shadow-sm">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-primary hover:border-primary/50 transition-colors shadow-sm">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 w-10"></th>
                                    <th className="p-4">Équipement ↑↓</th>
                                    <th className="p-4">Emplacement ↑↓</th>
                                    <th className="p-4">Propriétés</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* Map each Zone as a Gateway/Main node for UI purposes */}
                                {site.zones?.map((zone) => (
                                    <React.Fragment key={zone.id}>
                                        <tr
                                            onClick={() => setExpandedRows(prev => ({ ...prev, [zone.id]: !prev[zone.id] }))}
                                            className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        >
                                            <td className="p-4 text-slate-400">
                                                {expandedRows[zone.id] ? <ChevronDown className="h-4 w-4 group-hover:text-primary transition-colors" /> : <ChevronRight className="h-4 w-4 group-hover:text-primary transition-colors" />}
                                            </td>
                                            <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center">
                                                {`CEOS-${zone.name.toUpperCase().replace(/\s/g, '-')}`}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">
                                                {zone.name}
                                            </td>
                                            <td className="p-4">
                                                {/* No specific properties for a gateway/zone node usually */}
                                            </td>
                                        </tr>
                                        {/* Sensors for this Zone */}
                                        {expandedRows[zone.id] && zone.sensors?.map((sensor: any) => {
                                            const type = sensor.type.toLowerCase();
                                            let Pills = <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-400 rounded-md">-</span>;

                                            // Mocking Pill visualizations to match the desired template
                                            if (type.includes('temp') || type.includes('ambiance')) {
                                                Pills = (
                                                    <div className="flex gap-2">
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md shadow-sm">18.6 °C</span>
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md shadow-sm">47.4 %RH</span>
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md shadow-sm">1 lx</span>
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 rounded-md px-3">-</span>
                                                    </div>
                                                );
                                            } else if (type.includes('présence') || type.includes('motion')) {
                                                Pills = (
                                                    <div className="flex gap-2 relative group/tooltip">
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-[#142A38] dark:bg-slate-700 text-white dark:text-white rounded-md cursor-help shadow-sm">Motion</span>
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#142A38] dark:bg-black text-white text-[10px] px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-medium after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#142A38] dark:after:border-t-black">
                                                            1 minute(s) auparavant
                                                        </div>
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 rounded-md px-3">-</span>
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 rounded-md px-3">-</span>
                                                    </div>
                                                );
                                            } else if (type.includes('co2')) {
                                                Pills = (
                                                    <div className="flex gap-2">
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md shadow-sm">450 ppm</span>
                                                    </div>
                                                );
                                            } else {
                                                Pills = (
                                                    <div className="flex gap-2">
                                                        <span className="px-2.5 py-1 text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md shadow-sm">N</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <tr key={sensor.id} className="border-b border-slate-50 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                                    <td className="p-4" />
                                                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 flex items-center before:content-['>'] before:text-slate-300 dark:before:text-slate-600 before:mr-4 before:font-bold">
                                                        {sensor.name}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                                        {zone.name}
                                                    </td>
                                                    <td className="p-4">
                                                        {Pills}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}

                                {(!site.zones || site.zones.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                            Aucun équipement disponible.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Add Zone */}
            {isAddZoneOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
                        <button onClick={() => setIsAddZoneOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="h-5 w-5" /></button>
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center"><Plus className="w-5 h-5 mr-2 text-primary" /> Nouvelle Zone</h2>
                        <form onSubmit={handleCreateZone} className="space-y-4">
                            <div><label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom de la Zone</label>
                                <input type="text" required value={newZone.name} onChange={e => setNewZone({ ...newZone, name: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="ex: Open Space Ouest" /></div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-bold text-slate-700 dark:text-slate-300">Type de Pièce</label>
                                    <select value={newZone.type} onChange={e => setNewZone({ ...newZone, type: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-primary outline-none transition-all">
                                        <option value="Office">Bureau</option><option value="Meeting Room">Salle de Réunion</option><option value="Hall">Hall / Accueil</option><option value="Storage">Stockage</option><option value="Retail">Espace de Vente</option>
                                    </select></div>
                                <div><label className="text-sm font-bold text-slate-700 dark:text-slate-300">Étage (Niveau)</label>
                                    <input type="text" required value={newZone.floor} onChange={e => setNewZone({ ...newZone, floor: e.target.value })} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-primary outline-none transition-all" placeholder="ex: R+1" /></div>
                            </div>

                            <button type="submit" className="w-full py-3 mt-6 bg-primary hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">Créer la Zone</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
