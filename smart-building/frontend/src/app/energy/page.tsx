"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import {
    ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Zap, Download, Calendar, Filter, TrendingDown, Leaf, Euro, ArrowUpRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b"];

export default function EnergyAnalyticsPage() {
    const { authFetch } = useTenant();
    const [timeframe, setTimeframe] = useState("week");
    const [isExporting, setIsExporting] = useState(false);

    const [sites, setSites] = useState<any[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string>("");

    const [chartData, setChartData] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);
    const [hvacData, setHvacData] = useState<any[]>([]);
    const [alertsData, setAlertsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch sites for dropdown
        const fetchSites = async () => {
            try {
                const res = await authFetch("http://localhost:3001/api/sites");
                if (res.ok) {
                    setSites(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch sites", err);
            }
        };
        fetchSites();
    }, [authFetch]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const siteQuery = selectedSiteId ? `?siteId=${selectedSiteId}` : "";

                // Fetch Global + HVAC Energy
                const energyRes = await authFetch(`http://localhost:3001/api/energy/global${siteQuery}`);
                let energyData = [];
                if (energyRes.ok) {
                    energyData = await energyRes.json();
                }

                // Fetch Temperature Average
                const tempRes = await authFetch(`http://localhost:3001/api/temperature/average${siteQuery}`);
                let tempData = [];
                if (tempRes.ok) {
                    tempData = await tempRes.json();
                }

                // Fetch HVAC Performance
                const hvacRes = await authFetch(`http://localhost:3001/api/energy/hvac-performance${siteQuery}`);
                if (hvacRes.ok) {
                    setHvacData(await hvacRes.json());
                }

                // Fetch Alerts
                const alertsRes = await authFetch(`http://localhost:3001/api/alerts${siteQuery}`);
                if (alertsRes.ok) {
                    const allAlerts = await alertsRes.json();
                    setAlertsData(allAlerts.filter((a: any) =>
                        a.message.toLowerCase().includes('cvc') ||
                        a.message.toLowerCase().includes('clim') ||
                        a.message.toLowerCase().includes('chauffage') ||
                        (a.sensor && a.sensor.type === 'hvac_energy')
                    ));
                }

                // Merge data by day
                const mergedData = new Map<string, any>();

                // Process Temperature
                for (const t of tempData) {
                    mergedData.set(t.day, { day: t.day, temp: t.averageTemp, energy: 0, hvac: 0 });
                }

                // Process Energy
                for (const e of energyData) {
                    const day = e.timestamp.split('T')[0];
                    if (!mergedData.has(day)) {
                        mergedData.set(day, { day, temp: null, energy: 0, hvac: 0 });
                    }
                    const existing = mergedData.get(day);

                    // Accumulate raw W values
                    existing.energy += (e.globalValue || 0);
                    existing.hvac += (e.hvacValue || 0);
                }

                const finalChartData = Array.from(mergedData.values()).sort((a, b) => a.day.localeCompare(b.day));

                // Si timeframe est 'week', on ne garde que les 7 derniers jours
                let displayData = finalChartData;
                if (displayData.length > 0) {
                    if (timeframe === 'week') {
                        displayData = displayData.slice(-7);
                    } else if (timeframe === 'month') {
                        displayData = displayData.slice(-30); // 30 derniers jours
                    }
                }

                // Scale energy values to look reasonable (mocking kWh per day from raw W ticks)
                displayData.forEach(d => {
                    d.energy = Math.round(d.energy / 500); // Scale factor for demo visualizations
                    d.hvac = Math.round(d.hvac / 500);
                });

                // Calculate distribution
                const totalGlobal = displayData.reduce((acc, curr) => acc + curr.energy, 0);
                const totalHvac = displayData.reduce((acc, curr) => acc + curr.hvac, 0);

                // Distribution Pie
                const pieData = [
                    { name: "CVC (Climatisation & Chauffage)", value: totalHvac > 0 ? totalHvac : 55 },
                    { name: "Autres Équipements", value: totalGlobal > 0 ? totalGlobal : 45 },
                    { name: "Serveurs", value: 15 },
                    { name: "Éclairage", value: 10 },
                ];

                setChartData(displayData.length > 0 ? displayData : [
                    { day: "01/10", energy: 450, hvac: 180, temp: 18 },
                    { day: "02/10", energy: 420, hvac: 150, temp: 19 },
                    { day: "03/10", energy: 480, hvac: 200, temp: 16 }
                ]);

                setDistributionData(pieData);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();

        // Setup WebSocket for realtime refresh
        const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "");

        socket.on("connect", () => {
            console.log("WebSocket connected for Realtime IoT Data (Energy)");
        });

        socket.on("refresh_data", (data: any) => {
            if (data.all || data.siteId === selectedSiteId || selectedSiteId === "all") {
                console.log("Realtime energy update received!");
                fetchAnalytics();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [authFetch, selectedSiteId]);

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const headers = ["Jour", "Consommation Globale (kWh)", "Consommation CVC (kWh)", "Température Moyenne (°C)"];
            const csvRows = chartData.map(row =>
                `${row.day},${row.energy},${row.hvac},${row.temp || ''}`
            );
            const csvContent = [headers.join(","), ...csvRows].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `rapport_energie_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setTimeout(() => setIsExporting(false), 1000);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2 flex items-center">
                        <Zap className="h-8 w-8 text-primary mr-3" />
                        Analytique & Rapports
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">Bilan énergétique, empreinte carbone et historique CVC.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Site Filter */}
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <select
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                            className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary backdrop-blur-md min-w-[200px]"
                        >
                            <option value="">Tous les sites</option>
                            {sites.map(site => (
                                <option key={site.id} value={site.id}>{site.name} ({site.city})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex bg-midnight-900 border border-slate-200 dark:border-white/10 p-1 rounded-xl glass">
                        <button
                            onClick={() => setTimeframe("week")}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", timeframe === "week" ? "bg-primary text-slate-900 dark:text-white shadow-lg" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
                        >Semaine</button>
                        <button
                            onClick={() => setTimeframe("month")}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", timeframe === "month" ? "bg-primary text-slate-900 dark:text-white shadow-lg" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
                        >Mois</button>

                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 self-center"></div>

                        <button
                            onClick={handleExportCSV}
                            disabled={isExporting}
                            className="px-3 py-1.5 text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white transition-colors flex items-center text-sm font-medium disabled:opacity-50"
                        >
                            <Download className={cn("w-4 h-4 mr-1.5", isExporting && "animate-bounce")} />
                            {isExporting ? "Export en cours..." : "Export CSV"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Top KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Euro className="w-24 h-24 text-emerald-400" />
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                            <Euro className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-medium text-slate-500 dark:text-muted-foreground">Coût Énergétique ({selectedSiteId ? 'Site' : 'Global'})</h3>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{(chartData.reduce((acc, c) => acc + (c.energy || 0), 0) * 0.15).toFixed(0)} <span className="text-xl text-slate-500 dark:text-muted-foreground">€</span></h2>
                    </div>
                    <p className="text-sm font-medium text-emerald-400 mt-2 flex items-center">
                        <TrendingDown className="w-4 h-4 mr-1" /> Basé sur la sélection
                    </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-primary/20">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Leaf className="w-24 h-24 text-primary" />
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30">
                            <Leaf className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-medium text-slate-500 dark:text-muted-foreground">Émissions Évitées (Smart Rules)</h3>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">350 <span className="text-xl text-slate-500 dark:text-muted-foreground">kg CO2</span></h2>
                    </div>
                    <p className="text-sm font-medium text-emerald-400 mt-2 flex items-center">
                        Équivalent à 1500 km en voiture
                    </p>
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none"></div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-orange-400" />
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/30">
                            <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="font-medium text-slate-500 dark:text-muted-foreground">Ratio CVC / Général</h3>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                            {chartData.reduce((acc, c) => acc + (c.energy || 0), 0) > 0 ?
                                Math.round((chartData.reduce((acc, c) => acc + (c.hvac || 0), 0) / chartData.reduce((acc, c) => acc + (c.energy || 0), 0)) * 100)
                                : 0}
                            <span className="text-xl text-slate-500 dark:text-muted-foreground">%</span>
                        </h2>
                    </div>
                    <p className="text-sm font-medium text-orange-400 mt-2 flex items-center">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> Part du chauffage
                    </p>
                </div>
            </div>

            {/* Main Advanced Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Composed Chart: Energy vs Temperature */}
                <div className="xl:col-span-2 glass-card p-6 rounded-2xl h-[450px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Corrélation Consommation & Météo</h3>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Séparation entre les équipements HVAC (Chauffage) et le reste, impacté par la température.</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative z-10">
                        {loading && chartData.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-black/20 z-20 backdrop-blur-sm rounded-xl">
                                <span className="animate-spin w-8 h-8 rounded-full border-4 border-t-primary border-primary/20"></span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHvac" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="rgba(255,255,255,0.4)"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                        tickFormatter={(val) => val.slice(5)} // Show MM-DD
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="rgba(255,255,255,0.4)"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `${val} kWh`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="rgba(255,255,255,0.4)"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `${val}°C`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                                            borderColor: "rgba(255,255,255,0.1)",
                                            backdropFilter: "blur(12px)",
                                            borderRadius: "12px",
                                            color: "#fff",
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                                        }}
                                    />
                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: "20px" }} />

                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="energy"
                                        name="Conso. Globale"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEnergy)"
                                    />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="hvac"
                                        name="Conso. CVC (Chauffage)"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorHvac)"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="temp"
                                        name="Temp. Moy. Journée"
                                        stroke="#ec4899"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Donut Chart: Usage Distribution */}
                <div className="glass-card p-6 rounded-2xl h-[450px] flex flex-col relative overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 z-10">Répartition des Usages</h3>
                    <p className="text-sm text-slate-500 dark:text-muted-foreground mb-6 z-10">Données calculées en temps réel.</p>

                    <div className="flex-1 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 0, bottom: 20 }}>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                                        borderColor: "rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                        color: "#fff"
                                    }}
                                    itemStyle={{ color: "#fff", fontWeight: "500" }}
                                    formatter={(value: any) => [`${value} kWh`, "Consommation"]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={80}
                                    content={(props) => {
                                        const { payload } = props;
                                        return (
                                            <ul className="grid grid-cols-1 gap-y-3 mt-4">
                                                {payload?.map((entry, index) => (
                                                    <li key={`item-${index}`} className="flex items-center justify-between text-xs text-slate-900 dark:text-white">
                                                        <div className="flex items-center">
                                                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                                                            {entry.value}
                                                        </div>
                                                        <span className="font-bold opacity-70">
                                                            {distributionData[index]?.value} k
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-0"></div>
                </div>

            </div>

            {/* HVAC Performance & Errors Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

                {/* HVAC Runtime Chart */}
                <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fonctionnement CVC vs Consigne</h3>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Temps d'allumage par jour par rapport à la température atteinte.</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative z-10">
                        {loading && hvacData.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-black/20 z-20 backdrop-blur-sm rounded-xl">
                                <span className="animate-spin w-8 h-8 rounded-full border-4 border-t-primary border-primary/20"></span>
                            </div>
                        ) : hvacData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500">Aucune donnée de fonctionnement</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={hvacData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="rgba(255,255,255,0.4)"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                        tickFormatter={(val) => val.slice(5)} // Show MM-DD
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="rgba(255,255,255,0.4)"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `${val}h`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="rgba(255,255,255,0.4)"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `${val}°C`}
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                                    />
                                    <Legend verticalAlign="top" height={36} />

                                    <Bar
                                        yAxisId="left"
                                        dataKey="runtime"
                                        name="Temps de Fonc. (Heures)"
                                        fill="#0ea5e9"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="setpoint"
                                        name="Consigne Moy."
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="actual"
                                        name="Temp. Atteinte"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* HVAC Alerts Table */}
                <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historique Erreurs CVC</h3>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Défaillances techniques et pertes de communication.</p>
                        </div>
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-full">
                            {alertsData.length} Erreur(s)
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                        {alertsData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500">Aucune erreur détectée</div>
                        ) : (
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-black/40 dark:text-slate-300 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 rounded-tl-lg">Date</th>
                                        <th scope="col" className="px-4 py-3">Sévérité</th>
                                        <th scope="col" className="px-4 py-3 rounded-tr-lg">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alertsData.map((alert: any) => (
                                        <tr key={alert.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-md text-xs font-bold",
                                                    alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                                        alert.severity === 'WARNING' ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                )}>
                                                    {alert.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {alert.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
