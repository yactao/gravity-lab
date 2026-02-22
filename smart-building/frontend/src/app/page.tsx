"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MonthlyComparisonChart } from "@/components/dashboard/MonthlyComparisonChart";

import { Zap, Thermometer, Wind, AlertTriangle, Activity, ActivitySquare, CloudRain, Sun, Maximize2, Minimize2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

export default function Home() {
  const { authFetch } = useTenant();
  const [readings, setReadings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [globalEnergy, setGlobalEnergy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [readingsRes, alertsRes, energyRes] = await Promise.all([
          authFetch("http://localhost:3001/api/readings?limit=50"),
          authFetch("http://localhost:3001/api/alerts"),
          authFetch("http://localhost:3001/api/energy/global")
        ]);
        if (readingsRes.ok) setReadings(await readingsRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (energyRes.ok) setGlobalEnergy(await energyRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup WebSocket for realtime refresh
    const socket: Socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("WebSocket connected for Realtime IoT Data (Global)");
    });

    socket.on("refresh_data", () => {
      console.log("Global Realtime update received! Refreshing global dashboard data...");
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [authFetch]);

  const getLatest = (type: string) => {
    const latest = readings.find((r) => r.sensor?.type === type);
    return latest ? latest.value : null;
  };

  const temp = getLatest("temperature");
  const co2 = getLatest("co2");

  // Get latest energy directly from the global energy curve (usually the last element is the newest, or we check sorted)
  const energy = globalEnergy.length > 0 ? globalEnergy[globalEnergy.length - 1].value : getLatest("energy");

  // Calculate a fake "Health Score" based on data
  const healthScore = Math.max(0, 100 - (alerts.length * 5) - (co2 && co2 > 1000 ? 10 : 0));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4">

      {/* Welcome Section & Global Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
          <div className="flex items-center text-slate-900 dark:text-white mb-2">
            <ActivitySquare className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
              Cockpit Global
            </h1>
          </div>
          <p className="text-slate-500 dark:text-muted-foreground font-medium">Vue d'ensemble et pilotage en temps réel du parc immobilier UBBEE.</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Weather Widget */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <Sun className="h-6 w-6 text-yellow-400" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">18°C Paris</h4>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">Ensoleillé</p>
            </div>
          </div>

          {/* System Status */}
          <div className="text-right glass-card p-3 rounded-xl border border-slate-200 dark:border-white/5">
            <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground mb-1 uppercase tracking-wider">État Réseau IoT</p>
            <div className="flex items-center justify-end font-bold text-sm">
              <span className={cn("w-2.5 h-2.5 rounded-full mr-2 shadow-sm", loading ? "bg-amber-500" : "bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]")}></span>
              <span className={loading ? "text-amber-500" : "text-slate-900 dark:text-white"}>
                {loading ? "Synchronisation..." : "Actif & Synchronisé"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col justify-center items-center border-primary/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground mb-2 relative z-10">Health Score Parc</p>
          <div className="relative z-10 flex items-baseline">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{healthScore}</span>
            <span className="text-xl font-bold text-primary ml-1">/100</span>
          </div>
          <p className="text-xs text-primary mt-2 flex items-center relative z-10 font-medium">
            Excellent état
          </p>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full"></div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Consommation du Parc"
            value={energy ? `${energy.toFixed(0)} W` : "-- W"}
            trend={energy ? "+1.2%" : "..."}
            trendUp={false}
            icon={Zap}
            color="cyan"
          />
          <StatsCard
            title="Température Moyenne"
            value={temp ? `${temp.toFixed(1)}°C` : "--°C"}
            trend={temp ? "-0.1%" : "..."}
            trendUp={true}
            icon={Thermometer}
            color="orange"
          />
          <StatsCard
            title="Qualité d'Air (CO2)"
            value={co2 ? `${co2.toFixed(0)} ppm` : "-- ppm"}
            trend="Stable"
            trendUp={true}
            icon={Wind}
            color="green"
          />
          <StatsCard
            title="Alertes Actives"
            value={alerts.length.toString()}
            trend={alerts.length > 0 ? "+X" : "Stable"}
            trendUp={alerts.length === 0}
            icon={AlertTriangle}
            color={alerts.length > 0 ? "red" : "purple"}
          />
        </div>
      </div>

      {/* Main Content Grid: 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Comparative Power Chart (Span 8) */}
        <div className="lg:col-span-8 glass-card p-6 h-[460px] rounded-2xl flex flex-col border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Comparatif Consommation (N-1 vs N)</h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">Économies d'énergie sur l'année</p>
            </div>
            <div className="flex space-x-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
              <button className="px-3 py-1 rounded text-xs font-medium text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white transition-colors">Jour</button>
              <button className="px-3 py-1 rounded text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm">Mois</button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <MonthlyComparisonChart />
          </div>
        </div>

        {/* Right Column: Feeds (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Real-time Alerts Feed */}
          <div className="glass-card p-4 rounded-2xl flex-1 flex flex-col min-h-[190px] border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-orange-400" />
                Défauts du Parc
              </h3>
              {alerts.length > 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded">{alerts.length}</span>}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {/* Simulated grouped errors based on alerts array length/content */}
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Règles non déclenchées</p>
                </div>
                <span className="text-xs font-bold text-orange-500">
                  {alerts.filter(a => a.message.toLowerCase().includes('règle') || a.message.toLowerCase().includes('rule')).length || 0}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Capteurs HS / Hors-ligne</p>
                </div>
                <span className="text-xs font-bold text-red-500">
                  {alerts.filter(a => a.message.toLowerCase().includes('offline') || a.message.toLowerCase().includes('timeout') || a.message.toLowerCase().includes('hs')).length || (alerts.length > 0 ? 1 : 0)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_5px_rgba(244,63,94,0.8)]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Codes erreur CVC (Climatisation)</p>
                </div>
                <span className="text-xs font-bold text-rose-500">
                  {alerts.filter(a => a.message.toLowerCase().includes('hvac') || a.message.toLowerCase().includes('cvc') || a.message.toLowerCase().includes('clim')).length || 0}
                </span>
              </div>

              {alerts.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-muted-foreground py-4">
                  <span className="text-emerald-500 text-2xl mb-1 opacity-50">✓</span>
                  <p className="text-[11px] font-semibold">Aucun incident technique</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent IoT Activity */}
          <div className="glass-card p-4 rounded-2xl flex-1 flex flex-col min-h-[210px] border-slate-200 dark:border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-3">
              <Activity className="h-4 w-4 mr-1.5 text-primary" />
              Flux de données IoT
            </h3>
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
              {readings.slice(0, 4).map((r, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
                      r.sensor?.type === "temperature" ? "bg-orange-500/10 text-orange-400" :
                        r.sensor?.type === "co2" ? "bg-emerald-500/10 text-emerald-400" :
                          "bg-cyan-500/10 text-cyan-400"
                    )}>{r.sensor?.type?.substring(0, 4)}</span>
                    <span className="text-xs text-slate-500 dark:text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString([], { second: '2-digit', minute: '2-digit', hour: '2-digit' })}</span>
                  </div>
                  <span className="text-sm font-mono text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {r.value.toFixed(1)} <span className="text-[10px] text-slate-500 dark:text-muted-foreground ml-0.5">{r.sensor?.unit}</span>
                  </span>
                </div>
              ))}
              {readings.length === 0 && !loading && (
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground text-center mt-6">En attente des capteurs...</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
