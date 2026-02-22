"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Html } from "@react-three/drei";
import * as THREE from "three";
import { Thermometer, Wind, MapPin } from "lucide-react";

interface BuildingModelProps {
    temperature?: number;
    co2?: number;
}

// A single room block that changes color based on temperature
function Room({ position, size, name, isMainRoom, temperature, co2, defaultColor }: any) {
    // Color calculation based on temperature data
    let baseColor = defaultColor || "#1e293b"; // Default color

    if (isMainRoom && temperature) {
        baseColor = temperature > 24 ? "#ef4444" : temperature < 20 ? "#3b82f6" : "#10b981";
    }

    return (
        <group position={position}>
            {/* Floor */}
            <Box args={[size[0], 0.1, size[2]]} position={[0, -0.05, 0]}>
                <meshStandardMaterial color={baseColor} opacity={0.3} transparent />
            </Box>

            {/* Walls (Glassmorphism effect) */}
            <Box args={[size[0], size[1], size[2]]} position={[0, size[1] / 2, 0]}>
                <meshPhysicalMaterial
                    color={baseColor}
                    transmission={0.8}
                    opacity={1}
                    roughness={0.2}
                    metalness={0.1}
                    transparent
                />
            </Box>

            {/* Crispy HTML Marker overlaying the 3D scene */}
            <Html position={[0, size[1] + 0.5, 0]} center zIndexRange={[100, 0]}>
                <div className={`glass px-3 py-2 rounded-xl text-slate-900 dark:text-white shadow-2xl whitespace-nowrap min-w-[130px] backdrop-blur-md border ${isMainRoom ? 'bg-midnight-950/80 border-primary/30' : 'bg-midnight-950/60 border-slate-200 dark:border-white/5'} transition-all hover:scale-105 pointer-events-none`}>
                    <p className="text-xs font-bold text-slate-900 dark:text-white/90 mb-1 border-b border-slate-200 dark:border-white/10 pb-1 flex justify-between items-center">
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-primary/70" /> {name}</span>
                        {isMainRoom && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-2" />}
                    </p>

                    {isMainRoom ? (
                        <div className="flex flex-col gap-1.5 mt-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center text-slate-500 dark:text-muted-foreground"><Thermometer className="w-3 h-3 mr-1" /> Temp</span>
                                <span className="font-mono font-bold text-orange-400">{temperature?.toFixed(1)}°C</span>
                            </div>
                            {co2 && (
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="flex items-center text-slate-500 dark:text-muted-foreground"><Wind className="w-3 h-3 mr-1" /> CO2</span>
                                    <span className="font-mono font-bold text-emerald-400">{co2?.toFixed(0)} ppm</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-500 dark:text-muted-foreground mt-1 text-center italic">Non monitoré</p>
                    )}
                </div>
            </Html>
        </group>
    );
}

export function BuildingModel({ temperature = 22, co2 = 450 }: BuildingModelProps) {
    const [selectedSite, setSelectedSite] = useState("siege");
    const [selectedFloor, setSelectedFloor] = useState("r1");

    return (
        <div className="w-full h-full relative flex flex-col pointer-events-auto">

            {/* Contextual Selectors */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-auto">
                <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-white/20 text-slate-900 dark:text-white text-xs font-medium rounded-lg px-2 py-1.5 glass outline-none transition-colors cursor-pointer"
                >
                    <option value="siege">Siège Social UBBEE (Paris)</option>
                    <option value="bordeaux">Magasin Concept Store (Bordeaux)</option>
                    <option value="hotel">Hôtel Smart Rivoli (Paris)</option>
                </select>
                <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-white/20 text-slate-900 dark:text-white text-xs font-medium rounded-lg px-2 py-1.5 glass outline-none transition-colors cursor-pointer"
                >
                    <option value="rdc">RDC</option>
                    <option value="r1">Étage R+1</option>
                    <option value="r2">Étage R+2</option>
                </select>
            </div>

            <Canvas camera={{ position: [6, 6, 6], fov: 45 }} className="flex-1 pointer-events-auto">
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
                <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />

                {/* Floor Base */}
                <Box args={[8, 0.2, 8]} position={[0, -0.1, 0]}>
                    <meshStandardMaterial color="#0f172a" />
                    <lineSegments>
                        <edgesGeometry args={[new THREE.BoxGeometry(8, 0.2, 8)]} />
                        <lineBasicMaterial color="#334155" />
                    </lineSegments>
                </Box>

                {/* Rooms */}
                <group position={[0, 0, 0]}>
                    {/* Open Space (Monitored) */}
                    <Room position={[-1.5, 0, -1.5]} size={[3, 1.5, 3]} name="Open Space" isMainRoom={true} temperature={temperature} co2={co2} />

                    {/* Meeting Room */}
                    <Room position={[2, 0, -2]} size={[2, 1.5, 2]} name="Salle Réunion" isMainRoom={false} defaultColor="#ef4444" />

                    {/* Server Room */}
                    <Room position={[2.5, 0, 1.5]} size={[1.5, 2, 3]} name="Baies Serveurs" isMainRoom={false} defaultColor="#3b82f6" />
                </group>

                <OrbitControls
                    enablePan={true}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={3}
                    maxDistance={15}
                />
            </Canvas>
        </div>
    );
}
