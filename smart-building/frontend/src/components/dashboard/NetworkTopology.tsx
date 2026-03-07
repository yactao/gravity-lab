"use client";

import { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection,
    addEdge,
    useReactFlow,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Cloud, Cpu, Radio, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

// Nœud central statique (Le Cloud Casa)
const cloudNodeId = 'cloud-core';
const cloudNode: Node = {
    id: cloudNodeId,
    type: 'default',
    position: { x: 400, y: 0 },
    data: {
        label: (
            <div className="flex flex-col items-center p-3 text-slate-800 dark:text-white">
                <Cloud className="w-10 h-10 text-blue-500 mb-2" />
                <span className="font-bold text-lg">Plateforme Casa</span>
                <span className="text-xs text-emerald-500 flex items-center mt-1 font-bold"><ShieldCheck className="w-3 h-3 mr-1" /> CORE OK</span>
            </div>
        )
    },
    style: { backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px solid rgba(59, 130, 246, 0.5)', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
};

export default function NetworkTopology() {
    const [nodes, setNodes] = useState<Node[]>([cloudNode]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const fetchTopology = useCallback(async () => {
        try {
            // Dans le vrai système multi-tenant, on devrait passer un orgId. 
            // Pour la page admin globale (System Health), on utilise la route dédiée non-authentifiée
            const res = await fetch(`${API_URL}/api/health/topology`);
            if (!res.ok) return;

            const sites = await res.json();

            let newNodes: Node[] = [cloudNode];
            let newEdges: Edge[] = [];

            let gatewayX = 100;
            const GATEWAY_Y = 200;
            const SENSOR_Y = 400;

            sites.forEach((site: any) => {
                // Pour chaque Gateway
                const siteGateways = site.gateways || [];
                // Pour la rétro-compatibilité avec les mocks, s'il n'y a pas de gateway explicite, 
                // mais des capteurs, on simulera un noeud U-bot virtuel pour ce site.
                const allSensors: any[] = [];
                site.zones?.forEach((z: any) => {
                    if (z.sensors) allSensors.push(...z.sensors);
                });

                if (siteGateways.length === 0 && allSensors.length === 0) return; // Site vide

                // S'il n'y a pas de gateway enregistrée mais qu'on a des capteurs (les vieux mocks)
                let mainGatewayId = `gw-mock-${site.id}`;
                let gatewayDisplay = 'Passerelle Virtuelle';
                let gatewayMac = 'Simulée';

                if (siteGateways.length > 0) {
                    mainGatewayId = `gw-${siteGateways[0].id}`;
                    gatewayDisplay = siteGateways[0].name || 'U-Bot Gateway';
                    gatewayMac = siteGateways[0].serialNumber || 'Inconnu';
                }

                // --------- NOEUD GATEWAY ---------
                newNodes.push({
                    id: mainGatewayId,
                    type: 'default',
                    position: { x: gatewayX, y: GATEWAY_Y },
                    data: {
                        label: (
                            <div className="flex flex-col items-center p-2 text-slate-800 dark:text-white">
                                <Cpu className="w-8 h-8 text-indigo-500 mb-2" />
                                <span className="font-bold text-sm">{gatewayDisplay}</span>
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded mt-1">{gatewayMac}</span>
                                <span className="text-[10px] text-emerald-500 mt-2 font-bold">• CONNECTÉ</span>
                            </div>
                        )
                    },
                    style: { backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '12px', minWidth: '160px' }
                });

                // Lien Cloud -> Gateway
                newEdges.push({
                    id: `e-cloud-${mainGatewayId}`,
                    source: cloudNodeId,
                    target: mainGatewayId,
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 }
                });


                // --------- NOEUDS CAPTEURS ---------
                let sensorX = gatewayX - ((allSensors.length * 120) / 2) + 60; // Centrer les capteurs sous la gateway
                const now = Date.now();

                allSensors.forEach(sensor => {
                    // Calcul d'état basé sur lastSeenAt
                    let isMock = sensor.id.startsWith('mock-');
                    let status = 'ONLINE'; // default
                    let color = '#10b981'; // emerald
                    let bgColor = 'rgba(16, 185, 129, 0.05)';
                    let icon = <Radio className="w-5 h-5 text-emerald-500 mb-1.5" />;
                    let timeText = 'Actif';

                    if (!isMock) {
                        if (sensor.lastSeenAt) {
                            const lastSeenTimestamp = new Date(sensor.lastSeenAt).getTime();
                            const diffMinutes = (now - lastSeenTimestamp) / (1000 * 60);

                            if (diffMinutes < 5) { // Moins de 5 minutes -> VERT
                                status = 'ONLINE';
                                color = '#10b981';
                                timeText = `Il y a ${Math.floor(diffMinutes)}m`;
                            } else if (diffMinutes < 60) { // Moins de 1h -> ORANGE
                                status = 'WARNING';
                                color = '#f97316';
                                bgColor = 'rgba(249, 115, 22, 0.05)';
                                icon = <Activity className="w-5 h-5 text-orange-500 mb-1.5" />;
                                timeText = `Il y a ${Math.floor(diffMinutes)}m`;
                            } else { // Plus de 1h -> ROUGE
                                status = 'OFFLINE';
                                color = '#f43f5e';
                                bgColor = 'rgba(244, 63, 94, 0.05)';
                                icon = <ShieldAlert className="w-5 h-5 text-rose-500 mb-1.5" />;
                                const hours = Math.floor(diffMinutes / 60);
                                timeText = `Il y a ${hours > 24 ? Math.floor(hours / 24) + 'j' : hours + 'h'}`;
                            }
                        } else {
                            // Jamais vu
                            status = 'OFFLINE';
                            color = '#slate-500';
                            bgColor = 'rgba(100, 116, 139, 0.05)';
                            icon = <ShieldAlert className="w-5 h-5 text-slate-500 mb-1.5" />;
                            timeText = 'Jamais connecté';
                        }
                    } else {
                        // C'est un mock, on le force au vert
                        timeText = 'Virtuel';
                    }

                    newNodes.push({
                        id: `s-${sensor.id}`,
                        type: 'default',
                        position: { x: sensorX, y: SENSOR_Y },
                        data: {
                            label: (
                                <div className="flex flex-col items-center p-1.5 text-slate-800 dark:text-white">
                                    {icon}
                                    <span className="text-[11px] font-bold text-center leading-tight truncate w-24" title={sensor.name}>{sensor.name}</span>
                                    <span className="text-[9px] mt-1 font-medium" style={{ color: color }}>
                                        {timeText}
                                    </span>
                                </div>
                            )
                        },
                        style: { backgroundColor: bgColor, border: `1px solid ${color}40`, borderRadius: '8px', minWidth: '110px' }
                    });

                    // Lien Gateway -> Sensor
                    newEdges.push({
                        id: `e-${mainGatewayId}-${sensor.id}`,
                        source: mainGatewayId,
                        target: `s-${sensor.id}`,
                        animated: status !== 'OFFLINE',
                        style: {
                            stroke: color,
                            strokeWidth: status === 'OFFLINE' ? 1 : 1.5,
                            strokeDasharray: status === 'WARNING' ? '5,5' : 'none',
                            opacity: status === 'OFFLINE' ? 0.3 : 1
                        },
                        markerEnd: { type: MarkerType.ArrowClosed, color: color }
                    });

                    sensorX += 130;
                });

                gatewayX += Math.max(400, (allSensors.length * 130) + 100); // Espacer les sites
            });

            // Centrer le noeud Cloud par rapport aux gateways créées
            if (newNodes.length > 1) {
                newNodes[0].position.x = (gatewayX - 400 + 100) / 2;
            }

            setNodes(newNodes);
            setEdges(newEdges);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchTopology();
        const interval = setInterval(fetchTopology, 30000); // Refresh graphe toutes les 30s
        return () => clearInterval(interval);
    }, [fetchTopology]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    return (
        <div className="h-[500px] w-full border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-black/20">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
                <Background gap={12} size={1} color="rgba(150,150,150,0.1)" />
            </ReactFlow>
        </div>
    );
}
