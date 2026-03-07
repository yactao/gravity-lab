"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TemperatureKnobProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    color?: 'emerald' | 'blue' | 'orange' | 'rose';
    label?: string;
}

export function TemperatureKnob({ value, min = 15, max = 30, onChange, color = 'emerald', label }: TemperatureKnobProps) {
    const knobRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Mappage des couleurs pour l'indicateur
    const colorMap = {
        emerald: 'bg-emerald-500 shadow-emerald-500/50',
        blue: 'bg-blue-500 shadow-blue-500/50',
        orange: 'bg-orange-500 shadow-orange-500/50',
        rose: 'bg-rose-500 shadow-rose-500/50',
    };

    const textColorMap = {
        emerald: 'text-emerald-500',
        blue: 'text-blue-500',
        orange: 'text-orange-500',
        rose: 'text-rose-500',
    };

    // L'angle physique de la molette. -135 degrés = min, +135 degrés = max. Total = 270 degrés.
    const getAngleFromValue = (val: number) => {
        const percentage = (val - min) / (max - min);
        // Map 0 -> -135deg, 1 -> +135deg
        return (percentage * 270) - 135;
    };

    const getValueFromAngle = (angle: number) => {
        // Map -135deg -> 0, +135deg -> 1
        let percentage = (angle + 135) / 270;
        // Clamper entre 0 et 1
        percentage = Math.max(0, Math.min(1, percentage));

        let rawValue = min + (percentage * (max - min));
        // Arrondir par pas de 0.5
        return Math.round(rawValue * 2) / 2;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        updateValueFromEvent(e.clientX, e.clientY);

        // Empêcher le comportement tactile par défaut de navigateur (scroll) pendant la rotation
        if (e.pointerType === 'touch') {
            e.preventDefault();
        }
    };

    const updateValueFromEvent = useCallback((clientX: number, clientY: number) => {
        if (!knobRef.current) return;

        const rect = knobRef.current.getBoundingClientRect();

        // Trouver le centre de l'élément (X et Y)
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculer l'angle entre le centre et le point cliqué (en radians)
        const x = clientX - centerX;
        const y = centerY - clientY; // y inversé car écran y pointe vers le bas

        // atan2 retourne un angle en radians entre -PI et PI (0 = droite, PI/2 = haut)
        let angleRad = Math.atan2(x, y); // x et y inversés pour avoir 0 = haut (12h)

        // Convertir en degrés (-180 à 180)
        let angleDeg = angleRad * (180 / Math.PI);

        // Limiter la rotation entre -135° (Sud-Ouest) et +135° (Sud-Est)
        // Autour de -180 / +180 (le bas), on clamp
        if (angleDeg < -135 && angleDeg > -180) angleDeg = -135;
        if (angleDeg > 135 && angleDeg <= 180) angleDeg = 135;

        // Si on est dans la zone "morte" en bas, on ignore ou on clamp au plus près
        if (Math.abs(angleDeg) > 135) {
            angleDeg = angleDeg < 0 ? -135 : 135;
        }

        const newValue = getValueFromAngle(angleDeg);
        if (newValue !== value) {
            onChange(newValue);
        }
    }, [min, max, value, onChange]);

    // Écouteurs globaux pour le drag n drop (pour ne pas perdre le focus si on sort du div)
    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (isDragging) {
                updateValueFromEvent(e.clientX, e.clientY);
                e.preventDefault(); // Pour éviter les scroll intempestifs sur mobile/web
            }
        };

        const handlePointerUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            // Utiliser pointermove/up pour supporter souris + tactile de manière unifiée
            window.addEventListener('pointermove', handlePointerMove, { passive: false });
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('pointercancel', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [isDragging, updateValueFromEvent]);

    const currentAngle = getAngleFromValue(value);

    return (
        <div className="flex flex-col items-center justify-center">
            {/* L'ombre externe et le conteneur principal du Knob */}
            <div
                className="relative w-48 h-48 rounded-full flex items-center justify-center touch-none select-none cursor-pointer group"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                    boxShadow: '10px 10px 30px rgba(0,0,0,0.05), -10px -10px 30px rgba(255,255,255,0.8), inset 2px 2px 5px rgba(255,255,255,1), inset -2px -2px 5px rgba(0,0,0,0.05)'
                }}
                ref={knobRef}
                onPointerDown={handlePointerDown}
            >
                {/* Marques des graduations (Ticks) autour de la molette */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                    {[...Array(11)].map((_, i) => {
                        // 11 ticks répartis de -135 à +135 degrés (tous les 27 degrés)
                        const tickAngle = -135 + (i * 27);
                        const isPrimary = i % 5 === 0; // Marque plus grosse pour min, milieu, max

                        // Convertir pour le SVG draw (rotation autour de 50,50)
                        return (
                            <line
                                key={i}
                                x1="50" y1="10" x2="50" y2={isPrimary ? "14" : "12"}
                                stroke="currentColor"
                                strokeWidth={isPrimary ? "1.5" : "1"}
                                strokeOpacity={currentAngle >= tickAngle ? "0.4" : "0.1"}
                                className="text-slate-900 dark:text-white transition-opacity duration-300"
                                transform={`rotate(${tickAngle} 50 50)`}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                {/* Le centre rotatif réel (Face de la molette) */}
                <div
                    className="absolute w-36 h-36 rounded-full flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(253,253,253,1) 0%, rgba(243,244,246,1) 100%)',
                        boxShadow: 'inset 5px 5px 15px rgba(255,255,255,0.8), inset -5px -5px 15px rgba(0,0,0,0.03), 0 5px 15px rgba(0,0,0,0.05)',
                        transform: `rotate(${currentAngle}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                >
                    {/* Dark mode support overlay */}
                    <div className="absolute inset-0 rounded-full dark:opacity-100 opacity-0 transition-opacity" style={{
                        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                        boxShadow: 'inset 5px 5px 15px rgba(255,255,255,0.02), inset -5px -5px 15px rgba(0,0,0,0.5)'
                    }}></div>

                    {/* Le point d'indication (LED) */}
                    <div
                        className={`absolute top-4 left-1/2 -ml-1.5 w-3 h-3 rounded-full ${colorMap[color]} shadow-lg transition-transform ${isDragging ? 'scale-110' : ''}`}
                    />
                </div>

                {/* Valeur numérique au centre (Fixe, ne tourne pas) */}
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                    <span className={`text-3xl font-black tracking-tighter ${textColorMap[color]} drop-shadow-sm`}>
                        {value.toFixed(1)}<span className="text-xl font-bold align-top ml-0.5">°</span>
                    </span>
                    {label && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{label}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
