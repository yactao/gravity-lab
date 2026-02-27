"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Loader2, Sun, ThermometerSun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapping Open-Meteo WMO codes to Lucide icons
const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="h-5 w-5 text-amber-500" />;
    if (code >= 1 && code <= 3) return <Cloud className="h-5 w-5 text-slate-400" />;
    if (code >= 45 && code <= 48) return <CloudFog className="h-5 w-5 text-slate-400" />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className="h-5 w-5 text-blue-500" />;
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return <CloudSnow className="h-5 w-5 text-sky-300" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="h-5 w-5 text-amber-600" />;
    return <ThermometerSun className="h-5 w-5 text-primary" />;
};

// Map code to short label
const getWeatherLabel = (code: number) => {
    if (code === 0) return "Ensoleillé";
    if (code === 1) return "Peu nuageux";
    if (code === 2) return "Part. nuageux";
    if (code === 3) return "Couvert";
    if (code >= 45 && code <= 48) return "Brouillard";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Averses / Pluie";
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return "Neige";
    if (code >= 95 && code <= 99) return "Orage";
    return "Variable";
};

export function WeatherWidget() {
    const [weather, setWeather] = useState<{ temp: number; code: number; wind: number } | null>(null);
    const [cityInfo, setCityInfo] = useState<string>("Localisation...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtenir la météo par coordonnées via Open-Meteo (Gratuit, pas de clé API)
        const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`);
                const data = await res.json();
                if (data.current) {
                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        code: data.current.weather_code,
                        wind: Math.round(data.current.wind_speed_10m)
                    });

                    if (!cityName) {
                        // Tenter de reverse geocode au moins la ville (avec l'API open-meteo)
                        const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
                        const revData = await revRes.json();
                        setCityInfo(revData.address?.city || revData.address?.town || revData.address?.village || "Positions");
                    } else {
                        setCityInfo(cityName);
                    }
                }
            } catch (err) {
                console.error("Erreur Météo:", err);
            } finally {
                setLoading(false);
            }
        };

        // Essayer d'utiliser la géolocalisation du navigateur
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    // Si l'utilisateur refuse la localisation, on se rabat sur Paris par défaut
                    console.warn("Geoloc refusée, fallback sur Paris");
                    fetchWeather(48.8566, 2.3522, "Paris");
                },
                { timeout: 5000 }
            );
        } else {
            fetchWeather(48.8566, 2.3522, "Paris");
        }
    }, []);

    if (loading) {
        return (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded"></div>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className="hidden md:flex items-center justify-between group cursor-default">
            <div className="flex items-center space-x-3 bg-white dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-black/40 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
                <div className="flex items-center justify-center p-1 rounded-full bg-slate-100 dark:bg-white/10">
                    {getWeatherIcon(weather.code)}
                </div>

                <div className="flex flex-col">
                    <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none">
                            {weather.temp}°
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {cityInfo}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[9px] text-slate-500 font-medium">
                            {getWeatherLabel(weather.code)}
                        </span>
                        <span className="text-[9px] text-slate-400 flex items-center">
                            <Wind className="h-2.5 w-2.5 mr-0.5" />
                            {weather.wind} km/h
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
