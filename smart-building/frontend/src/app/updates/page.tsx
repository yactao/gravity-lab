"use client";

import { CloudUpload, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

const controllers = [
    { id: "CTRL-101", type: "Thermostat Central", currentVersion: "v2.1.0", latestVersion: "v2.1.4", upToDate: false },
    { id: "CTRL-102", type: "Thermostat Central", currentVersion: "v2.1.4", latestVersion: "v2.1.4", upToDate: true },
    { id: "SENS-CO2-A", type: "Sonde Air Quality", currentVersion: "v1.0.5", latestVersion: "v1.0.5", upToDate: true },
    { id: "SENS-POW-B", type: "Compteur Énergie", currentVersion: "v1.8.0", latestVersion: "v1.9.1", upToDate: false },
];

export default function ControllerUpdatesPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex items-center text-slate-800 mb-8 pt-4">
                <CloudUpload className="h-8 w-8 mr-3 text-emerald-600" />
                <h1 className="text-3xl font-semibold tracking-tight">Mises à Jour Contrôleurs</h1>
            </div>

            <div className="soft-card p-8 mb-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-900 dark:text-white border-none">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Firmware Update v2.1.4 Disponible</h2>
                        <p className="text-emerald-50 opacity-90 max-w-lg">
                            Le nouveau firmware améliore la stabilité de la connexion MQTT et réduit la consommation d'énergie des sondes de température.
                        </p>
                    </div>
                    <button className="mt-6 md:mt-0 px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Mettre à jour tous les appareils obsolètes
                    </button>
                </div>
            </div>

            <div className="soft-card overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Liste des Contrôleurs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-medium">Device ID</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Version Actuelle</th>
                                <th className="px-6 py-4 font-medium">Dernière Version</th>
                                <th className="px-6 py-4 font-medium">Statut</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {controllers.map((ctrl) => (
                                <tr key={ctrl.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{ctrl.id}</td>
                                    <td className="px-6 py-4 text-slate-600">{ctrl.type}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{ctrl.currentVersion}</td>
                                    <td className="px-6 py-4 text-emerald-600 font-mono text-sm font-semibold">{ctrl.latestVersion}</td>
                                    <td className="px-6 py-4">
                                        {ctrl.upToDate ? (
                                            <span className="flex items-center text-emerald-600 text-sm font-semibold">
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> À jour
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-amber-500 text-sm font-semibold">
                                                <AlertCircle className="w-4 h-4 mr-1" /> Obsolète
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!ctrl.upToDate && (
                                            <button className="px-4 py-1.5 bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition">
                                                Update (OTA)
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
