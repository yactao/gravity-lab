"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MonthlyComparisonChart } from "@/components/dashboard/MonthlyComparisonChart";

import { Zap, Thermometer, Wind, AlertTriangle, Activity, ActivitySquare, CloudRain, Sun, Maximize2, Minimize2, MapPin, Settings2, X, Check, Users, Server, AlertOctagon, TrendingDown, Building, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';

const SortableWidget = ({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative group h-full", className)}>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 p-1.5 bg-slate-200/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-slate-300 dark:hover:bg-slate-700 backdrop-blur-sm shadow-sm"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.87868 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.87868 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.87868 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.87868 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z" fill="currentColor"></path></svg>
      </div>
      {children}
    </div>
  );
};

export default function Home() {
  const { authFetch, currentTenant } = useTenant();
  const router = useRouter();
  const [readings, setReadings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [globalEnergy, setGlobalEnergy] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartbuild_dashboard_widgets');
      if (saved) return JSON.parse(saved);
    }
    return {
      stats: true,
      comparativeChart: true,
      alertsFeed: true,
      iotFeed: true,
      weather: true,
    };
  });
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartbuild_dashboard_order');
      if (saved) return JSON.parse(saved);
    }
    return ['stats', 'comparativeChart', 'alertsFeed', 'iotFeed'];
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('smartbuild_dashboard_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('smartbuild_dashboard_order', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items: any) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [readingsRes, alertsRes, energyRes, kpisRes] = await Promise.all([
          authFetch("http://localhost:3001/api/readings?limit=50"),
          authFetch("http://localhost:3001/api/alerts"),
          authFetch("http://localhost:3001/api/energy/global"),
          authFetch("http://localhost:3001/api/dashboard/kpis")
        ]);
        if (readingsRes.ok) setReadings(await readingsRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (energyRes.ok) setGlobalEnergy(await energyRes.json());
        if (kpisRes.ok) setKpis(await kpisRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup WebSocket for realtime refresh
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "");

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

  const isGlobalContext = currentTenant?.id === '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4">

      {/* Welcome Section & Global Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
          <div className="flex items-center text-slate-900 dark:text-white mb-2">
            <ActivitySquare className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mr-4">
              {isGlobalContext ? "Cockpit Global" : "Cockpit Client"}
            </h1>
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <Settings2 className="w-3.5 h-3.5" /> Personnaliser
            </button>
          </div>
          <p className="text-slate-500 dark:text-muted-foreground font-medium">
            {isGlobalContext ? "Vue d'ensemble et pilotage en temps réel du parc immobilier UBBEE." : "Vue d'ensemble de votre parc immobilier."}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Weather Widget */}
          {widgets.weather && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Sun className="h-6 w-6 text-yellow-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">18°C Paris</h4>
                <p className="text-xs text-slate-500 dark:text-muted-foreground">Ensoleillé</p>
              </div>
            </div>
          )}

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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-row-dense">
            {widgetOrder.map(id => {
              if (id === 'stats' && widgets.stats) {
                return (
                  <SortableWidget key={id} id={id} className="col-span-1 lg:col-span-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-full">
                      <div
                        className={cn(
                          "lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col justify-center items-center border-primary/20 relative overflow-hidden group transition-all duration-300",
                          "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                        )}
                        onClick={() => router.push('/network')}
                      >
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                        <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground mb-2 relative z-10">Health Score Parc</p>
                        <div className="relative z-10 flex items-baseline">
                          <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{kpis?.globalHealthScore !== undefined ? kpis.globalHealthScore : healthScore}</span>
                          <span className="text-xl font-bold text-primary ml-1">/100</span>
                        </div>
                        <p className="text-xs text-primary mt-2 flex items-center relative z-10 font-medium group-hover:underline">
                          {(kpis?.globalHealthScore || healthScore) > 80 ? 'Excellent état, voir détails' : 'Attention requise, voir détails'}
                        </p>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full"></div>
                      </div>

                      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isGlobalContext && kpis ? (
                          <>
                            <StatsCard
                              title="Bâtiments Gérés"
                              value={kpis.totalSites.toString()}
                              trend={`${kpis.totalClients} Clients`}
                              trendUp={true}
                              icon={Building}
                              color="cyan"
                              onClick={() => router.push('/sites')}
                            />
                            <StatsCard
                              title="Incidents en Cours"
                              value={kpis.activeIncidents.toString()}
                              trend={`${kpis.criticalAlerts} Critiques`}
                              trendUp={kpis.activeIncidents === 0}
                              icon={AlertOctagon}
                              color={kpis.activeIncidents > 0 ? "red" : "green"}
                              onClick={() => router.push('/alerts')}
                            />
                            <StatsCard
                              title="Sites Hors Objectifs"
                              value={kpis.outOfTargetSites.toString()}
                              trend={kpis.outOfTargetSites > 0 ? "À surveiller" : "Optimal"}
                              trendUp={kpis.outOfTargetSites === 0}
                              icon={Target}
                              color={kpis.outOfTargetSites > 0 ? "orange" : "green"}
                              onClick={() => router.push('/sites?filter=out_of_target')} // Note: query param might need implementation on target page
                            />
                            <StatsCard
                              title="État de la Flotte IoT"
                              value={kpis.totalSensors.toString()}
                              trend={`${kpis.offlineGateways} GW hors-ligne`}
                              trendUp={kpis.offlineGateways === 0}
                              icon={Server}
                              color={kpis.offlineGateways > 0 ? "orange" : "cyan"}
                              onClick={() => router.push('/network')}
                            />
                          </>
                        ) : (
                          <>
                            <StatsCard
                              title="Consommation du Parc"
                              value={energy ? `${energy.toFixed(0)} W` : "-- W"}
                              trend={energy ? "+1.2%" : "..."}
                              trendUp={false}
                              icon={Zap}
                              color="cyan"
                              onClick={() => router.push('/energy')}
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
                              onClick={() => router.push('/alerts')}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </SortableWidget>
                );
              }

              if (id === 'comparativeChart' && widgets.comparativeChart) {
                return (
                  <SortableWidget key={id} id={id} className={cn("flex", (widgets.alertsFeed || widgets.iotFeed) ? "col-span-1 lg:col-span-8 lg:row-span-2" : "col-span-1 lg:col-span-12")}>
                    <div className="glass-card w-full p-6 h-[460px] rounded-2xl flex flex-col border-slate-200 dark:border-white/5">
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
                      <div className="flex-1 w-full relative -z-10 group-hover:z-0 transition-all">
                        <MonthlyComparisonChart />
                      </div>
                    </div>
                  </SortableWidget>
                );
              }

              if (id === 'alertsFeed' && widgets.alertsFeed) {
                return (
                  <SortableWidget key={id} id={id} className={cn("flex", widgets.comparativeChart ? "col-span-1 lg:col-span-4 lg:row-span-1" : "col-span-1 lg:col-span-6")}>
                    <div className="glass-card w-full p-4 rounded-2xl flex flex-col h-[220px] border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1.5 text-orange-400" />
                          Défauts du Parc
                        </h3>
                        {alerts.length > 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded">{alerts.length}</span>}
                      </div>

                      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Dépassement de seuils</p>
                          </div>
                          <span className="text-xs font-bold text-orange-500">
                            {alerts.filter(a => a.message.toLowerCase().includes('co2') || a.message.toLowerCase().includes('seuil') || a.message.toLowerCase().includes('élevé')).length || 0}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Capteurs HS / Communication</p>
                          </div>
                          <span className="text-xs font-bold text-red-500">
                            {alerts.filter(a => a.message.toLowerCase().includes('communication') || a.message.toLowerCase().includes('batterie') || a.message.toLowerCase().includes('hs') || a.message.toLowerCase().includes('offline')).length || 0}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_5px_rgba(244,63,94,0.8)]"></div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Codes erreur CVC</p>
                          </div>
                          <span className="text-xs font-bold text-rose-500">
                            {alerts.filter(a => a.message.toLowerCase().includes('cvc') || a.message.toLowerCase().includes('hvac') || a.message.toLowerCase().includes('surchauffe')).length || 0}
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
                  </SortableWidget>
                );
              }

              if (id === 'iotFeed' && widgets.iotFeed) {
                return (
                  <SortableWidget key={id} id={id} className={cn("flex", widgets.comparativeChart ? "col-span-1 lg:col-span-4 lg:row-span-1" : "col-span-1 lg:col-span-6")}>
                    <div className="glass-card w-full p-4 rounded-2xl flex flex-col border-slate-200 dark:border-white/5 bg-gradient-to-b from-white/5 to-transparent h-[216px]">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-3">
                        <Activity className="h-4 w-4 mr-1.5 text-primary" />
                        Flux de données IoT
                      </h3>
                      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
                        {readings.slice(0, 4).map((r, i) => (
                          <div key={i} className="flex justify-between items-center group/item">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
                                r.sensor?.type === "temperature" ? "bg-orange-500/10 text-orange-400" :
                                  r.sensor?.type === "co2" ? "bg-emerald-500/10 text-emerald-400" :
                                    "bg-cyan-500/10 text-cyan-400"
                              )}>{r.sensor?.type?.substring(0, 4)}</span>
                              <span className="text-xs text-slate-500 dark:text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString([], { second: '2-digit', minute: '2-digit', hour: '2-digit' })}</span>
                            </div>
                            <span className="text-sm font-mono text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">
                              {r.value.toFixed(1)} <span className="text-[10px] text-slate-500 dark:text-muted-foreground ml-0.5">{r.sensor?.unit}</span>
                            </span>
                          </div>
                        ))}
                        {readings.length === 0 && !loading && (
                          <p className="text-[11px] text-slate-500 dark:text-muted-foreground text-center mt-6">En attente des capteurs...</p>
                        )}
                      </div>
                    </div>
                  </SortableWidget>
                );
              }

              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Customize Dashboard Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setIsCustomizeOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-primary" /> Personnaliser l'Accueil
              </h2>
              <p className="text-xs text-slate-500 mt-1">Activez ou désactivez les widgets pour modifier l'affichage de votre cockpit.</p>
            </div>

            <div className="space-y-3">
              {/* Widget Options */}
              {[
                { key: "stats", label: "Indicateurs Clés (KPIs)", icon: ActivitySquare },
                { key: "comparativeChart", label: "Comparatif Consommation", icon: Zap },
                { key: "alertsFeed", label: "Flux des Défauts", icon: AlertTriangle },
                { key: "iotFeed", label: "Flux IoT en Direct", icon: Activity },
                { key: "weather", label: "Widget Météo", icon: Sun },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setWidgets((prev: any) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={cn(
                    "flex flex-row items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                    widgets[item.key as keyof typeof widgets]
                      ? "bg-primary/5 border-primary/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className={cn("w-5 h-5 mr-3", widgets[item.key as keyof typeof widgets] ? "text-primary" : "text-slate-400")} />
                    <span className={cn("text-sm font-bold", widgets[item.key as keyof typeof widgets] ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                      {item.label}
                    </span>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                    widgets[item.key as keyof typeof widgets]
                      ? "bg-primary border-primary text-white scale-110 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 scale-100"
                  )}>
                    {widgets[item.key as keyof typeof widgets] && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:bg-emerald-400"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
