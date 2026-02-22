"use client";

import { useState, useEffect } from "react";
import { CloudUpload, QrCode, MapPin, Search, CheckCircle2, ChevronRight, Settings, Radio, Server, ShieldCheck, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

export default function OnboardingPage() {
    const { authFetch, currentTenant } = useTenant();
    const [step, setStep] = useState(1);

    // Step 1: Device Detection
    const [deviceId, setDeviceId] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [deviceType, setDeviceType] = useState("gateway"); // 'gateway' | 'sensor'
    const [protocol, setProtocol] = useState("lorawan");
    const [isDetecting, setIsDetecting] = useState(false);

    // Step 2: Location
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState("");
    const [selectedZoneId, setSelectedZoneId] = useState("");

    // Step 3: Commissioning
    const [isPairing, setIsPairing] = useState(false);
    const [pairingProgress, setPairingProgress] = useState(0);

    // Fetch sites when entering Step 2
    useEffect(() => {
        if (step === 2 && sites.length === 0) {
            authFetch("http://localhost:3001/api/sites")
                .then(res => res.json())
                .then(data => {
                    setSites(data);
                    if (data.length > 0) setSelectedSiteId(data[0].id);
                });
        }
    }, [step, authFetch, sites.length]);

    const handleDetectDevice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deviceId.trim() || !deviceName.trim()) return;
        setIsDetecting(true);
        setTimeout(() => {
            setIsDetecting(false);
            setStep(2);
        }, 1200);
    };

    const handlePairing = async () => {
        setStep(3);
        setIsPairing(true);
        setPairingProgress(0);

        try {
            // Register hardware in backend
            if (deviceType === "gateway") {
                await authFetch("http://localhost:3001/api/gateways", {
                    method: "POST",
                    body: JSON.stringify({ name: deviceName, serialNumber: deviceId, siteId: selectedSiteId, protocol })
                });
            } else {
                // To Do: Create sensor endpoint (Optional for this specific phase but supported logically)
                console.log("Mock Sensor creation:", { name: deviceName, externalId: deviceId, zoneId: selectedZoneId });
            }
        } catch (e) {
            console.error("Save IoT failure", e);
        }

        // Simulate progressive pairing UI
        const interval = setInterval(() => {
            setPairingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsPairing(false);
                    return 100;
                }
                return prev + 25;
            });
        }, 600);
    };

    const resetProcess = () => {
        setStep(1);
        setDeviceId("");
        setSelectedSiteId("");
        setSelectedZoneId("");
        setPairingProgress(0);
    };

    const selectedSite = sites.find(s => s.id === selectedSiteId);

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-12 h-[calc(100vh-8rem)] flex flex-col">

            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full border border-primary/30 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CloudUpload className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Onboarding & Appairage IoT</h1>
                <p className="text-slate-500 dark:text-muted-foreground">Ajoutez de nouveaux capteurs ou passerelles Plug & Play au parc {currentTenant?.name || "Global"}.</p>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-center mb-12 max-w-2xl mx-auto w-full relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-white/10 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 delay-100" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

                <div className="relative z-10 flex justify-between w-full">
                    {[
                        { num: 1, title: "Identification" },
                        { num: 2, title: "Assignation" },
                        { num: 3, title: "Provisioning" }
                    ].map((s) => (
                        <div key={s.num} className="flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300",
                                step > s.num ? "bg-primary border-primary text-slate-900 dark:text-white" :
                                    step === s.num ? "bg-slate-900 border-primary text-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                                        "bg-slate-900 border-white/20 text-slate-500 dark:text-muted-foreground"
                            )}>
                                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={cn("text-xs font-semibold mt-2", step >= s.num ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-muted-foreground")}>{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Wizard Card */}
            <div className="flex-1 glass-card rounded-2xl border-slate-200 dark:border-white/10 p-6 md:p-8 flex flex-col items-center overflow-y-auto bg-white dark:bg-slate-900/60 shadow-2xl">

                {/* STEP 1: IDENTIFICATION */}
                {step === 1 && (
                    <div className="max-w-md w-full m-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Identifier le module</h2>
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Scannez le QRCode du capteur ou saisissez son identifiant LoRaWAN/EnOcean.</p>
                        </div>

                        <form onSubmit={handleDetectDevice} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center p-4 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <input type="radio" name="dType" value="gateway" checked={deviceType === 'gateway'} onChange={() => setDeviceType('gateway')} className="mr-3 text-primary focus:ring-primary" />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Passerelle</p>
                                        <p className="text-xs text-slate-500">Routeur IoT maître</p>
                                    </div>
                                </label>
                                <label className="flex items-center p-4 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <input type="radio" name="dType" value="sensor" checked={deviceType === 'sensor'} onChange={() => setDeviceType('sensor')} className="mr-3 text-primary focus:ring-primary" />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Capteur</p>
                                        <p className="text-xs text-slate-500">Périphérique d'ambiance</p>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold mb-1 block">Nom de l'équipement</label>
                                    <input type="text" placeholder="Ex: Gateway Hall Principal" value={deviceName} onChange={e => setDeviceName(e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50" required />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold mb-1 block">Protocole de communication</label>
                                    <select value={protocol} onChange={e => setProtocol(e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50" required>
                                        <option value="lorawan">LoRaWAN</option>
                                        <option value="zigbee">Zigbee</option>
                                        <option value="zwave">Z-Wave</option>
                                        <option value="modbus">Modbus (RTU/TCP)</option>
                                        <option value="wifi">Wi-Fi</option>
                                        <option value="enocean">EnOcean</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold mb-1 block">Identifiant / Clé MAC</label>
                                    <div className="relative group">
                                        <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input type="text" placeholder="Ex: SEN-TMP-A8F4" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-base text-slate-900 dark:text-white tracking-widest font-mono uppercase focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans" required />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isDetecting || !deviceId}
                                className="w-full py-4 rounded-xl font-bold text-slate-900 dark:text-white bg-primary hover:bg-emerald-400 transition-all flex justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
                            >
                                {isDetecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Scan réseau en cours...
                                    </>
                                ) : "Scanner le réseau"}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 flex gap-4 text-xs font-medium text-slate-500 dark:text-muted-foreground items-center justify-center">
                            <div className="flex items-center"><Radio className="w-3 h-3 mr-1 text-cyan-400" /> LoRaWAN compatible</div>
                            <div className="flex items-center"><Settings className="w-3 h-3 mr-1 text-orange-400" /> Zigbee 3.0</div>
                        </div>
                    </div >
                )
                }


                {/* STEP 2: ASSIGNATION */}
                {
                    step === 2 && (
                        <div className="max-w-lg w-full m-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-4">
                                <button onClick={() => setStep(1)} className="p-2 mr-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" /></button>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Positionnement - Jumeau Numérique</h2>
                                    <p className="text-xs text-slate-500 font-medium mb-1">Où souhaitez-vous placer cet équipement sur la maquette 3D ?</p>
                                    <p className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded inline-block">ID: {deviceId.toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-sm font-semibold text-slate-500 dark:text-muted-foreground mb-2 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1.5" /> Site d'installation
                                    </label>
                                    <select
                                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none hover:border-white/20 transition-colors"
                                        value={selectedSiteId}
                                        onChange={(e) => { setSelectedSiteId(e.target.value); setSelectedZoneId(""); }}
                                    >
                                        <option value="" disabled>Sélectionner un site...</option>
                                        {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                                    </select>
                                </div>

                                {deviceType === 'sensor' && (
                                    <div className={cn("transition-all duration-300", selectedSiteId ? "opacity-100" : "opacity-30 pointer-events-none")}>
                                        <label className="text-sm font-semibold text-slate-500 dark:text-muted-foreground mb-2 flex items-center">
                                            <Search className="w-4 h-4 mr-1.5" /> Zone / Pièce
                                        </label>
                                        <select
                                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none hover:border-white/20 transition-colors"
                                            value={selectedZoneId}
                                            onChange={(e) => setSelectedZoneId(e.target.value)}
                                        >
                                            <option value="" disabled>Sélectionner la zone d'installation...</option>
                                            {selectedSite?.zones?.map((z: any) => (
                                                <option key={z.id} value={z.id}>{z.name} (Niveau {z.floor})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5">
                                    <button
                                        onClick={handlePairing}
                                        disabled={!selectedSiteId || !selectedZoneId}
                                        className="w-full py-4 rounded-xl font-bold text-slate-900 dark:text-white bg-primary hover:bg-emerald-400 transition-all flex justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
                                    >
                                        Confirmer et Lancer le Provisioning <ChevronRight className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }


                {/* STEP 3: PROVISIONING (SIMULATION) */}
                {
                    step === 3 && (
                        <div className="max-w-md w-full m-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500 text-center flex flex-col items-center">

                            {pairingProgress < 100 ? (
                                <>
                                    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="64" cy="64" r="60" className="stroke-white/5 fill-none" strokeWidth="6" />
                                            <circle cx="64" cy="64" r="60" className="stroke-primary fill-none transition-all duration-300 ease-out" strokeWidth="6" strokeDasharray="377" strokeDashoffset={377 - (377 * pairingProgress) / 100} />
                                        </svg>
                                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{pairingProgress}%</div>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configuration en cours...</h2>
                                    <p className="text-sm text-slate-500 dark:text-muted-foreground animate-pulse mb-8">Échange de clés de sécurité et inscription au registre Digital Twin.</p>

                                    <div className="w-full space-y-3 text-left">
                                        <div className="flex items-center text-sm"><CheckCircle2 className={cn("w-4 h-4 mr-2", pairingProgress >= 25 ? "text-primary" : "text-slate-900 dark:text-white/20")} /> <span className={pairingProgress >= 25 ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-muted-foreground"}>Connexion Gateway Etablie</span></div>
                                        <div className="flex items-center text-sm"><CheckCircle2 className={cn("w-4 h-4 mr-2", pairingProgress >= 50 ? "text-primary" : "text-slate-900 dark:text-white/20")} /> <span className={pairingProgress >= 50 ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-muted-foreground"}>Échange Clés Cryptographiques</span></div>
                                        <div className="flex items-center text-sm"><CheckCircle2 className={cn("w-4 h-4 mr-2", pairingProgress >= 75 ? "text-primary" : "text-slate-900 dark:text-white/20")} /> <span className={pairingProgress >= 75 ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-muted-foreground"}>Injection Modèle 3D BIM</span></div>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                        <ShieldCheck className="w-12 h-12 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appareil Provisionné avec Succès !</h2>
                                    <p className="text-sm text-slate-500 dark:text-muted-foreground mb-8">L'équipement est maintenant pleinement opérationnel dans le réseau de {currentTenant?.name || "Global"}.</p>

                                    <div className="flex gap-4 w-full">
                                        <button onClick={resetProcess} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 rounded-xl font-bold text-slate-900 dark:text-white transition-colors">Ajouter un autre</button>
                                        <button className="flex-1 py-3 bg-primary hover:bg-emerald-400 rounded-xl font-bold text-slate-900 dark:text-white transition-colors shadow-lg">Voir dans le Jumeau</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )
                }
            </div >

        </div >
    );
}
