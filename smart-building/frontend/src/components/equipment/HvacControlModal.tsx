import React, { useState } from 'react';
import { X, ThermometerSun, Wind, Info, AlertTriangle } from 'lucide-react';
import { TemperatureKnob } from '@/components/ui/TemperatureKnob';

interface HvacControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipmentName: string;
    initialHvacState: boolean;
    onToggleHvac: (state: boolean) => void;
    onCommand?: (action: string, value: any) => void;
}

export function HvacControlModal({ isOpen, onClose, equipmentName, initialHvacState, onToggleHvac, onCommand }: HvacControlModalProps) {
    const [heatingSetpoint, setHeatingSetpoint] = useState(21);
    const [coolingSetpoint, setCoolingSetpoint] = useState(24);
    const [thermostatMode, setThermostatMode] = useState('0'); // 0 = Off, 1 = Heat, 2 = Cool...
    const [fanMode, setFanMode] = useState('0'); // 0 = Auto, 1 = Low...
    const [hvacState, setHvacState] = useState(initialHvacState);

    React.useEffect(() => {
        if (!isOpen) return;
        const timerId = setTimeout(() => {
            if (onCommand && isOpen) {
                onCommand('set_parameters', {
                    heating: heatingSetpoint,
                    cooling: coolingSetpoint,
                    thermostatMode: thermostatMode,
                    fanMode: fanMode
                });
            }
        }, 800);
        return () => clearTimeout(timerId);
    }, [heatingSetpoint, coolingSetpoint, thermostatMode, fanMode, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-[#0B1120] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-transparent">
                    <div className="flex items-center">
                        <ThermometerSun className="w-6 h-6 mr-3 text-emerald-500" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Clim/chauffage {equipmentName}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">Contrôle précis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-10">

                    {/* Zone des Molettes (Knobs) */}
                    <div className="flex justify-around items-center space-x-4 border-b border-slate-100 dark:border-white/5 pb-8 pt-4">
                        <TemperatureKnob
                            value={heatingSetpoint}
                            onChange={setHeatingSetpoint}
                            color="orange"
                            label="Chauffage"
                        />

                        <div className="w-px h-32 bg-slate-200 dark:bg-white/5 hidden sm:block"></div>

                        <TemperatureKnob
                            value={coolingSetpoint}
                            onChange={setCoolingSetpoint}
                            color="blue"
                            label="Climatisation"
                        />
                    </div>

                    {/* Mode Thermostat */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                        <div className="w-1/2 pr-4">
                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-bold mb-3">
                                <ThermometerSun className="w-5 h-5 mr-3 text-emerald-500" />
                                Mode Thermostat
                            </div>
                            <div className="relative">
                                <select
                                    value={thermostatMode}
                                    onChange={(e) => setThermostatMode(e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none"
                                >
                                    <option value="0">Off</option>
                                    <option value="1">Auto</option>
                                    <option value="2">Heat</option>
                                    <option value="3">Cool</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/2 flex justify-end items-center h-full pt-8">
                            <span className="text-emerald-500 font-bold">{thermostatMode}</span>
                        </div>
                    </div>

                    {/* Mode Ventilateur */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                        <div className="w-1/2 pr-4">
                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-bold mb-3">
                                <Wind className="w-5 h-5 mr-3 text-emerald-500" />
                                Mode Ventilateur
                            </div>
                            <div className="relative">
                                <select
                                    value={fanMode}
                                    onChange={(e) => setFanMode(e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none"
                                >
                                    <option value="0">Auto</option>
                                    <option value="1">Low</option>
                                    <option value="2">Medium</option>
                                    <option value="3">High</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/2 flex justify-end items-center h-full pt-8">
                            <span className="text-emerald-500 font-bold">{fanMode}</span>
                        </div>
                    </div>

                    {/* Readonly Info Blocks */}
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-bold">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                                    <Info className="w-4 h-4 text-emerald-500" />
                                </div>
                                Setpoint (Auto Changeover)
                            </div>
                            <span className="text-emerald-500 font-bold">0 °C</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-bold">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                                    <Info className="w-4 h-4 text-emerald-500" />
                                </div>
                                Setpoint (Dry Air)
                            </div>
                            <span className="text-emerald-500 font-bold">0 °C</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-bold">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                                    <Info className="w-4 h-4 text-emerald-500" />
                                </div>
                                Setpoint (N/A)
                            </div>
                            <span className="text-emerald-500 font-bold">0 °C</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-bold">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                                    <AlertTriangle className="w-4 h-4 text-emerald-500" />
                                </div>
                                Hardware status
                            </div>
                            <span className="text-emerald-500 font-bold">3</span>
                        </div>
                    </div>

                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${hvacState ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 text-slate-500 dark:bg-white/10'}`}>
                            {hvacState ? 'Actif' : 'Inactif'}
                        </span>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={() => {
                                const newState = !hvacState;
                                setHvacState(newState);
                                onToggleHvac(newState);
                            }}
                            className={`px-8 py-2.5 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center ${hvacState ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#0B3B70] hover:bg-[#0B3B70]/80'}`}
                        >
                            <ThermometerSun className="w-5 h-5 mr-2" />
                            {hvacState ? 'Éteindre' : 'Contrôler (Allumer)'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
