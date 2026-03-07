"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Server, Radio, Box, Activity, ThermometerSun, Wind, Zap, Power, Wifi, Layers, Plus } from "lucide-react";
import { HvacControlModal } from '@/components/equipment/HvacControlModal';

function getRelativeTimeString(dateString: string) {
    const time = new Date(dateString).getTime();
    if (isNaN(time)) return "Jamais";
    const now = Date.now();
    const diffInMinutes = Math.floor((now - time) / 60000);

    if (diffInMinutes < 1) return "à l'instant";
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return `hier`;
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
}

const SENSOR_ICONS: Record<string, any> = {
    temp: { icon: ThermometerSun, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    motion: { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    switch: { icon: Power, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    co2: { icon: Wind, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    hvac: { icon: ThermometerSun, color: "text-[#0B3B70] dark:text-[#3B82F6]", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    default: { icon: Radio, color: "text-slate-400 dark:text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" }
};

export function EquipmentTable({ sites }: { sites: any[] }) {
    const [expandedGateways, setExpandedGateways] = useState<Record<string, boolean>>({});
    const [activeHvacEquipment, setActiveHvacEquipment] = useState<{ id: string, name: string } | null>(null);

    const toggleGateway = (gwId: string) => {
        setExpandedGateways(prev => ({ ...prev, [gwId]: !prev[gwId] }));
    };

    // Construire une liste aplatie des gateways
    const allGateways: any[] = [];
    sites?.forEach((site: any) => {
        site.gateways?.forEach((gw: any) => {

            // Chercher les capteurs liés à ce site/zones
            const sensors: any[] = [];
            site.zones?.forEach((zone: any) => {
                zone.sensors?.forEach((s: any) => {
                    sensors.push({ ...s, zoneName: zone.name });
                });
            });

            allGateways.push({
                ...gw,
                siteName: site.name,
                sensors: sensors
            });
        });

        if (!site.gateways || site.gateways.length === 0) {
            const sensors: any[] = [];
            site.zones?.forEach((zone: any) => {
                zone.sensors?.forEach((s: any) => {
                    sensors.push({ ...s, zoneName: zone.name });
                });
            });

            if (sensors.length > 0) {
                allGateways.push({
                    id: `virtual-gw-${site.id}`,
                    name: `Passerelle du site`,
                    serialNumber: "Virtuel",
                    status: "online",
                    siteName: site.name,
                    sensors: sensors
                });
            }
        }
    });

    if (allGateways.length === 0) {
        allGateways.push({
            id: 'mock-gw-1',
            name: `Passerelle Ubot - ${sites?.[0]?.name || 'Général'}`,
            serialNumber: 'UBOT-DEMO-8604',
            siteName: sites?.[0]?.name || 'Site Fictif',
            status: "online",
            sensors: [
                { id: 'm-s0', name: 'Aidoo Pro (Contrôleur AC)', zoneName: 'Espace principal', type: 'hvac', latestValue: null, lastSeenAt: new Date().toISOString() },
                { id: 'm-s1', name: 'Bascule Ete/Hiver', zoneName: 'Espace principal', type: 'switch', latestValue: null, lastSeenAt: new Date().toISOString() },
                { id: 'm-s2', name: 'Sonde T° - TEXTO1', zoneName: 'Extérieur', type: 'temp', latestValue: 18.6, lastSeenAt: new Date(Date.now() - 60000).toISOString() },
                { id: 'm-s3', name: 'Détecteur de présence', zoneName: 'Local Social 1', type: 'motion', latestValue: 1, lastSeenAt: new Date(Date.now() - 120000).toISOString() },
                { id: 'm-s4', name: 'Sonde T° - TINT02', zoneName: 'Local Social 1', type: 'temp', latestValue: 18.6, lastSeenAt: new Date(Date.now() - 300000).toISOString() },
                { id: 'm-s5', name: 'Unités Intérieures - IR01', zoneName: 'Local Social 1', type: 'temp', latestValue: 23.3, lastSeenAt: new Date().toISOString() },
                { id: 'm-s6', name: 'Détecteur de présence - PR02', zoneName: 'Local social 2', type: 'motion', latestValue: 0, lastSeenAt: new Date(Date.now() - 3600000).toISOString() },
                { id: 'm-s7', name: 'Qualité Air - TINT03', zoneName: 'Local social 2', type: 'co2', latestValue: 460, lastSeenAt: new Date(Date.now() - 86400000).toISOString() },
            ]
        });
    }

    const renderSensorPills = (sensor: any) => {
        const type = sensor.type?.toLowerCase() || "";
        const val = sensor.latestValue;

        let pills = [];

        if (type.includes('presence') || type.includes('motion')) {
            const isMotion = val === 1;
            pills.push(
                <span key="motion" className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.05)] border ${isMotion ? 'bg-cyan-100/50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>
                    {isMotion ? 'Mouvement détecté' : 'Calme'}
                </span>
            );
        } else if (type.includes('temp') || type.includes('ambiance')) {
            pills.push(
                <span key="temp" className="px-2 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.05)] border bg-white dark:bg-white/5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20">
                    {val !== null && val !== undefined ? `${val} °C` : '18.6 °C'}
                </span>
            );
            pills.push(
                <span key="rh" className="px-2 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.05)] border bg-white dark:bg-white/5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                    47.4 %
                </span>
            );
        } else if (type.includes('co2')) {
            pills.push(
                <span key="co2" className="px-2 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.05)] border bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20">
                    {val !== null && val !== undefined ? `${val} ppm` : '420 ppm'}
                </span>
            );
        } else if (type.includes('switch')) {
            const isOn = val === 1 || val === true;
            pills.push(
                <span key="switch" className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.05)] border ${isOn ? 'bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>
                    {isOn ? 'Actif' : 'Inactif'}
                </span>
            );
        } else if (type.includes('cvc') || type.includes('hvac')) {
            pills.push(
                <span key="cvc" className="px-2 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.05)] border bg-blue-50 dark:bg-white/5 text-[#0B3B70] dark:text-[#3B82F6] border-blue-200 dark:border-blue-500/20 flex items-center">
                    CVC Pilote
                </span>
            );
        }

        return (
            <div className="flex flex-wrap gap-1.5 items-center mt-2.5">
                {pills}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full p-2">
            {allGateways.map((gw, index) => {
                const isExpanded = expandedGateways[gw.id] ?? true;
                return (
                    <div key={gw.id} className="flex flex-col bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

                        {/* 1. Header Gateway (Card Title) */}
                        <div
                            className="p-5 flex justify-between items-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-500/5 dark:to-purple-500/5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.02] border-b border-slate-100 dark:border-white/5"
                            onClick={() => toggleGateway(gw.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex-shrink-0 bg-white dark:bg-black/40 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 flex justify-center items-center text-indigo-500">
                                    <Server className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight flex items-center">
                                        {gw.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-[9px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded tracking-wider">{gw.serialNumber}</span>
                                        <span className="text-[11px] font-medium text-slate-500 flex items-center">
                                            <Box className="w-3 h-3 justify-center mr-1" /> {gw.siteName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className={`flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1.5 ${gw.status !== 'offline' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${gw.status !== 'offline' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                    {gw.status !== 'offline' ? 'Online' : 'Offline'}
                                </span>
                                <div className="text-slate-400">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>

                        {/* 2. Grid de Capteurs (Card Body) */}
                        <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
                            {gw.sensors && gw.sensors.length > 0 ? (
                                <div className="p-4 bg-slate-50/50 dark:bg-transparent grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {gw.sensors.map((sensor: any) => {
                                        const type = sensor.type?.toLowerCase() || 'default';

                                        // Matching icon rules mapping
                                        let iconData = SENSOR_ICONS.default;
                                        if (type.includes('temp') || type.includes('ambiance')) iconData = SENSOR_ICONS.temp;
                                        if (type.includes('motion') || type.includes('presence')) iconData = SENSOR_ICONS.motion;
                                        if (type.includes('co2') || type.includes('voc')) iconData = SENSOR_ICONS.co2;
                                        if (type.includes('switch')) iconData = SENSOR_ICONS.switch;
                                        if (type.includes('hvac') || type.includes('cvc')) iconData = SENSOR_ICONS.hvac;

                                        const IconComponent = iconData.icon;
                                        const timeAgo = sensor.lastSeenAt ? getRelativeTimeString(sensor.lastSeenAt) : "Jamais vu";
                                        const isOnline = sensor.lastSeenAt && (Date.now() - new Date(sensor.lastSeenAt).getTime() < 86400000); // 24h

                                        return (
                                            <div key={sensor.id} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors group relative overflow-hidden">
                                                {/* Status indicator on the left side */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isOnline ? 'bg-emerald-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}></div>

                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`p-1.5 rounded-lg border ${iconData.bg} ${iconData.border}`}>
                                                            <IconComponent className={`w-3.5 h-3.5 ${iconData.color}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={sensor.name}>
                                                                {sensor.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center">
                                                                <Layers className="w-2.5 h-2.5 mr-1 opacity-50" />
                                                                {sensor.zoneName || "Non assigné"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {renderSensorPills(sensor)}

                                                {(type.includes('hvac') || type.includes('cvc')) && (
                                                    <div className="mt-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveHvacEquipment({ id: sensor.id, name: sensor.name });
                                                            }}
                                                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs flex items-center justify-center transition-colors shadow-sm"
                                                        >
                                                            <Radio className="w-3.5 h-3.5 mr-1.5" /> Contrôler CVC
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                                    <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 rounded">ID: {sensor.id.substring(0, 6)}..</span>
                                                    <span className="text-[9px] flex items-center text-slate-400">
                                                        <Wifi className={`w-2.5 h-2.5 mr-1 ${isOnline ? 'text-emerald-500' : 'text-slate-400 opacity-50'}`} />
                                                        {timeAgo}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50/50 dark:bg-transparent border-t border-slate-100 dark:border-white/5">
                                    <p className="text-xs text-slate-500">Aucun capteur détecté sur cette passerelle.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <HvacControlModal
                isOpen={activeHvacEquipment !== null}
                onClose={() => setActiveHvacEquipment(null)}
                equipmentName={activeHvacEquipment?.name || 'CVC'}
                initialHvacState={false}
                onToggleHvac={(state) => {
                    console.log(`HVAC state for ${activeHvacEquipment?.id} set to ${state}`);
                }}
            />
        </div>
    );
}
