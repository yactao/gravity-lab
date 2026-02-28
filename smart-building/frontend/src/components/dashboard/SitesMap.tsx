"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

let customIcon: any = null;

interface SitesMapProps {
    sites: any[];
}

export function SitesMap({ sites }: SitesMapProps) {
    const [iconReady, setIconReady] = useState(false);

    // Default center to France to encompass all mock sites
    const defaultCenter: [number, number] = [46.603354, 1.888334];
    const defaultZoom = 6;

    useEffect(() => {
        import("leaflet").then((L) => {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default?.src || "/marker-icon-2x.png",
                iconUrl: require("leaflet/dist/images/marker-icon.png").default?.src || "/marker-icon.png",
                shadowUrl: require("leaflet/dist/images/marker-shadow.png").default?.src || "/marker-shadow.png",
            });

            // Create a custom beautiful marker
            customIcon = new L.DivIcon({
                className: 'custom-pin',
                html: `<div style="
                    background-color: #10b981; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    width: 24px; 
                    height: 24px; 
                    box-shadow: 0 0 15px rgba(16,185,129,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                "><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });

            setIconReady(true);
        });
    }, []);

    if (!iconReady) {
        return <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 dark:bg-black/20 animate-pulse"></div>;
    }

    return (
        <div className="w-full h-full rounded-xl overflow-hidden relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="w-full h-full"
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%", background: "transparent" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                />

                {sites.map((site, index) => {
                    // Coordinate parsing to handle TypeORM decimal returning as string
                    let lat = site.latitude ? parseFloat(site.latitude) : null;
                    let lng = site.longitude ? parseFloat(site.longitude) : null;

                    // If coordinates are missing, provide fixed predictable coordinates to avoid re-render jumps
                    if (!lat || !lng) {
                        lat = 48.8566 + (index * 0.1);
                        lng = 2.3522 + (index * 0.1);
                    }

                    return (
                        <Marker
                            key={site.id}
                            position={[lat, lng] as [number, number]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => {
                                    window.dispatchEvent(new CustomEvent('preview-site', { detail: site }));
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong>{site.name}</strong><br />
                                    {site.address || "Adresse non spécifiée"}<br />
                                    Statut: <span className="text-emerald-500 font-bold">Actif</span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
