"use client";

import { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Activity, Database, GripVertical, Save } from "lucide-react";
import { useTenant } from "@/lib/TenantContext";

// 1. DRAGGABLE : La clé source du JSON (ex: "temperature")
function DraggableSourceKey({ id, text }: { id: string, text: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-3 mb-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center cursor-grab active:cursor-grabbing hover:border-primary transition-colors z-10 relative">
            <GripVertical className="w-4 h-4 text-slate-400 mr-2" />
            <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{"{ "}{text}{" }"}</span>
        </div>
    );
}

// 2. DROPPABLE : Le champ standard de destination (ex: "mesure_temperature")
function DroppableTargetField({ id, label, mappedKey }: { id: string, label: string, mappedKey?: string }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`p-4 mb-4 rounded-xl border-2 border-dashed transition-all flex flex-col min-h-[80px] ${isOver ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-slate-300 dark:border-slate-700"}`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Database className="w-3 h-3 mr-1" /> {label}
            </span>
            {mappedKey ? (
                <div className="bg-emerald-500 text-white p-2.5 rounded-lg text-sm font-bold flex items-center shadow-md">
                    Connecté : {mappedKey}
                </div>
            ) : (
                <div className="h-10 flex flex-1 items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic bg-slate-100/50 dark:bg-slate-800/30 rounded-lg">
                    Glissez une clé JSON ici...
                </div>
            )}
        </div>
    );
}

// 3. PAGE PRINCIPALE
export default function MappingPage() {
    const { authFetch } = useTenant();

    const [templateName, setTemplateName] = useState("Modèle Sonoff Temp/Humidité Zigbee");
    const [topicPattern, setTopicPattern] = useState("zigbee2mqtt/+");
    const [isSaving, setIsSaving] = useState(false);

    // Simulation: Clés reçues dans le dernier message MQTT local du capteur
    const incomingSourceKeys = ["temperature", "humidity", "battery", "linkquality", "occupancy", "illuminance", "voltage"];

    // Simulation: Les champs attendus par notre BDD
    const standardFields = [
        { id: "mesure_temperature_celsius", label: "Température (°C)" },
        { id: "mesure_humidite", label: "Humidité (%)" },
        { id: "etat_occupation", label: "Présence détectée (Bool)" },
        { id: "niveau_luminosite", label: "Luminosité (Lux)" },
        { id: "niveau_batterie", label: "Batterie Équipement (%)" }
    ];

    const [mappings, setMappings] = useState<Record<string, string>>({}); // { targetField: sourceKey }

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        // Si lâché sur une zone droppable valide
        if (over && over.id) {
            setMappings(prev => ({
                ...prev,
                [over.id]: active.id // Assigne la source (active.id) à la cible (over.id)
            }));
        }
    };

    const resetMapping = (targetFieldId: string) => {
        setMappings(prev => {
            const next = { ...prev };
            delete next[targetFieldId];
            return next;
        });
    };

    const saveMapping = async () => {
        const mappedItems = Object.entries(mappings).map(([target, source]) => ({ sourceKey: source, targetField: target }));

        if (mappedItems.length === 0) {
            alert("Veuillez mapper au moins un champ avant de sauvegarder.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                templateName,
                topicPattern,
                mappings: mappedItems
            };

            const res = await authFetch("http://localhost:3001/api/integrations/mapping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Mapping sauvegardé avec succès dans UBBEE !");
            } else {
                alert("Erreur lors de la sauvegarde.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex-1 w-full space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Activity className="w-6 h-6 mr-3 text-primary" /> Interopérabilité No-Code
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Liez visuellement les flux de données (JSON) en provenance du réseau IoT (ex: Zigbee2MQTT) aux champs standardisés de la plateforme UBBEE.
                    </p>

                    <div className="flex items-center gap-4 mt-4 bg-white dark:bg-black p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nom du Modèle</label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full"
                            />
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prefix Topic MQTT Limitrophe (Filtre)</label>
                            <input
                                type="text"
                                value={topicPattern}
                                onChange={(e) => setTopicPattern(e.target.value)}
                                className="text-sm font-bold font-mono text-slate-900 dark:text-white bg-transparent border-none outline-none w-full"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={saveMapping}
                    disabled={isSaving}
                    className="shrink-0 px-6 py-3 bg-primary hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Sauvegarde..." : "Enregistrer le Mapping"}
                </button>
            </div>

            {/* DND Layout */}
            <DndContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Colonne SOURCE (JSON entrant) */}
                    <div className="md:col-span-5 bg-slate-50/50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                                Payload Entrant (Source MQTT)
                            </h3>
                            <span className="text-[10px] bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 px-2 py-1 rounded font-bold">LIVE Payload</span>
                        </div>

                        <p className="text-xs text-slate-500 mb-4 italic">Faites glisser les propriétés JSON détectées vers la colonne de droite.</p>

                        <div className="space-y-3">
                            {incomingSourceKeys.map(key => {
                                // On peut griser ou cacher la clé si elle est déjà mappée
                                const isMapped = Object.values(mappings).includes(key);
                                return (
                                    <div key={key} className={`transition-all ${isMapped ? "opacity-30 pointer-events-none grayscale" : ""}`}>
                                        <DraggableSourceKey id={key} text={key} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Flèche visuelle au milieu (Optionnelle) */}
                    <div className="hidden md:flex md:col-span-2 items-center justify-center">
                        <div className="flex flex-col items-center opacity-30">
                            <div className="w-16 h-px bg-slate-400 dark:bg-slate-500"></div>
                            <Activity className="w-8 h-8 text-primary my-2" />
                            <div className="w-16 h-px bg-slate-400 dark:bg-slate-500"></div>
                        </div>
                    </div>

                    {/* Colonne DESTINATION (Colonnes STANDARDS BDD) */}
                    <div className="md:col-span-5 bg-slate-50/50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                                Base de Données UBBEE (Cible)
                            </h3>
                        </div>

                        <p className="text-xs text-slate-500 mb-4 italic">Associez les données pour un traitement universel.</p>

                        <div className="space-y-4">
                            {standardFields.map(field => (
                                <div key={field.id} className="relative group">
                                    <DroppableTargetField
                                        id={field.id}
                                        label={field.label}
                                        mappedKey={mappings[field.id]}
                                    />
                                    {mappings[field.id] && (
                                        <button
                                            onClick={() => resetMapping(field.id)}
                                            className="absolute top-2 right-2 text-[10px] text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded"
                                        >
                                            Retirer
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DndContext>
        </div>
    );
}
