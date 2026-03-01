"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Activity, Wifi, Play, Pause, Trash2, Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

export default function LiveIoTConsolePage() {
    const { authFetch } = useTenant();
    const [messages, setMessages] = useState<any[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [filter, setFilter] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock live data stream since we don't have real MQTT WS exposed yet
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            const randomId = Math.floor(Math.random() * 9000) + 1000;
            const temp = (Math.random() * 5 + 18).toFixed(1);
            const batt = (Math.random() * 0.5 + 3.2).toFixed(2);
            const co2 = Math.floor(Math.random() * 400 + 400);

            const mockPayloads = [
                { topic: `zigbee2mqtt/capteur_salon_${randomId}`, payload: `{"temperature": ${temp}, "battery": ${Math.floor(parseFloat(batt) * 20)}, "humidity": 45}` },
                { topic: `lorawan/app/device_${randomId}/rx`, payload: `{"data": {"temp_ext": ${temp}, "vBatt": ${batt}, "co2": ${co2}}}` },
                { topic: `zwavejs/node_${randomId}/status`, payload: `{"state": "Alive", "ready": true, "values": {"air_temp": ${temp}}}` },
                { topic: `modbus/cVC_rooftop_01`, payload: `{"register_4001": ${temp}, "register_4002": 1, "status": "ok"}` },
            ];

            const newMsg = mockPayloads[Math.floor(Math.random() * mockPayloads.length)];

            setMessages(prev => {
                const updated = [...prev, { ...newMsg, time: new Date() }];
                return updated.slice(-100); // Keep last 100
            });
        }, 1500 + Math.random() * 2000); // Random interval between 1.5s and 3.5s

        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        if (!isPaused && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isPaused]);

    const filteredMessages = messages.filter(m =>
        m.topic.toLowerCase().includes(filter.toLowerCase()) ||
        m.payload.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 pt-4 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2 flex items-center">
                        <Terminal className="h-8 w-8 text-primary mr-3" />
                        Console IoT Live
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-medium">Flux MQTT en temps réel pour le débogage matériel (Payloads bruts).</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl relative mr-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filtrer (ex: lorawan, temp...)"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent border-none text-sm text-slate-900 dark:text-white outline-none w-48 placeholder-slate-500"
                        />
                    </div>

                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold flex items-center border transition-all",
                            isPaused ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                        )}
                    >
                        {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                        {isPaused ? "Reprendre" : "Pause"}
                    </button>

                    <button
                        onClick={() => setMessages([])}
                        className="px-4 py-2 rounded-xl text-sm font-bold flex items-center bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-colors border border-slate-200 dark:border-white/10"
                    >
                        <Trash2 className="h-4 w-4 mr-2" /> Effacer
                    </button>
                </div>
            </div>

            {/* Console Window */}
            <div className="flex-1 glass-card rounded-2xl overflow-hidden border-slate-200 dark:border-white/5 bg-slate-900 dark:bg-[#060a12] flex flex-col font-mono relative shadow-2xl">
                {/* Console Top Bar */}
                <div className="flex items-center px-4 py-3 border-b border-white/10 bg-black/40 shrink-0">
                    <div className="flex space-x-2 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="flex items-center text-xs text-white/50 space-x-4">
                        <span className="flex items-center"><Wifi className="h-3 w-3 mr-1 text-emerald-400" /> Connecté au Broker MQTT (ws://localhost:9001)</span>
                        <span className="flex items-center"><Activity className="h-3 w-3 mr-1" /> Flux Actif</span>
                    </div>
                </div>

                {/* Console Log Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-sm space-y-1">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                            <Terminal className="h-12 w-12 opacity-50" />
                            <p className="font-sans">En attente de trams MQTT des U-Bots...</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg, i) => (
                            <div key={i} className="group hover:bg-white/5 p-1 rounded transition-colors break-all">
                                <span className="text-slate-500 mr-3">[{msg.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}]</span>
                                <span className="text-cyan-400 font-bold mr-3">{msg.topic}</span>
                                <span className="text-emerald-400/90">{msg.payload}</span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {filter && filteredMessages.length === 0 && messages.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                        <div className="text-white/50 font-sans flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-3 text-amber-500" /> Aucun résultat pour "{filter}"
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
