"use client";

import { Bell, ChevronDown, User, Search, LogOut, Briefcase, Sun, Moon, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";
import { GlobalSearch } from "./GlobalSearch";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { WeatherWidget } from "../dashboard/WeatherWidget";

export function Header() {
    const { currentTenant, logout, switchTenant, authFetch } = useTenant();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isAdmin = currentTenant?.role === "SUPER_ADMIN" || currentTenant?.role === "ENERGY_MANAGER";
    const [organizations, setOrganizations] = useState<any[]>([]);
    useEffect(() => {
        if (isAdmin) {
            authFetch("http://localhost:3001/api/organizations")
                .then(r => r.ok && r.json())
                .then(data => {
                    if (data) {
                        setOrganizations(data.filter((org: any) => org.id !== '11111111-1111-1111-1111-111111111111'));
                    }
                })
                .catch(console.error);
        }
    }, [isAdmin, authFetch]);

    // Close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <header className="sticky top-0 w-full h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 z-40 px-6 flex items-center justify-between transition-colors">
            {/* Search Bar - Global OmniSearch Component */}
            <GlobalSearch />

            {/* Right Actions / Profile (UBBEE mode) */}
            <div className="flex items-center space-x-6">

                {/* Weather Geolocation */}
                <WeatherWidget />

                {/* Global Client Switcher */}
                {isAdmin && organizations.length > 0 && (
                    <div className="relative group/tenant mr-2 hidden md:block">
                        <div className={`flex flex-col items-end pr-4 border-r border-slate-200 dark:border-white/10 ${pathname.match(/\/(sites|clients)\/[^/]+/) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest leading-tight">Contexte Client</span>
                            <div className={`flex items-center text-xs font-bold ${pathname.match(/\/(sites|clients)\/[^/]+/) ? 'text-slate-500' : 'cursor-pointer hover:text-primary transition-colors text-slate-900 dark:text-white'}`}>
                                {currentTenant?.name} {!pathname.match(/\/(sites|clients)\/[^/]+/) && <ChevronDown className="h-3 w-3 ml-1 opacity-50" />}
                            </div>
                        </div>
                        {/* Dropdown for Tenants */}
                        {!pathname.match(/\/(sites|clients)\/[^/]+/) && (
                            <div className="absolute top-full right-0 mt-1 pt-1 w-64 bg-transparent opacity-0 invisible group-hover/tenant:opacity-100 group-hover/tenant:visible transition-all z-50">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden mt-1">
                                    <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase px-2">Basculer le contexte vers :</p>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                                        <button
                                            onClick={() => switchTenant('11111111-1111-1111-1111-111111111111', 'Tous les clients')}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center transition-colors border border-transparent mb-1",
                                                currentTenant?.id === '11111111-1111-1111-1111-111111111111' ? "bg-primary text-white" : "text-primary hover:bg-primary/10"
                                            )}
                                        >
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            Vue d'ensemble
                                        </button>
                                        <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-1"></div>
                                        {organizations.map(org => (
                                            <button
                                                key={org.id}
                                                onClick={() => switchTenant(org.id, org.name)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center transition-colors border border-transparent",
                                                    currentTenant?.id === org.id ? "bg-primary/10 text-primary border-primary/20" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                                )}
                                            >
                                                <Building2 className="w-3.5 h-3.5 mr-2 opacity-70" />
                                                {org.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="relative p-2 rounded-full hover:bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white transition-colors"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button className="relative p-2 rounded-full hover:bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
                </button>

                {/* Profile Button (V3) */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className={cn(
                            "flex items-center cursor-pointer transition-all rounded-full pr-3 pl-1 py-1 border hover:bg-slate-100 dark:bg-white/5",
                            isProfileOpen ? "border-primary/50 bg-slate-50 dark:bg-white/5" : "border-transparent"
                        )}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="h-9 w-9 flex items-center justify-center rounded-full border border-primary/50 text-primary bg-primary/10 mr-3 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col mr-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{currentTenant?.userName || "Chargement..."}</span>
                            <span className="text-[10px] text-primary uppercase tracking-wider font-bold">{currentTenant?.name || "..."}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-slate-500 dark:text-muted-foreground ml-2 transition-transform duration-200", isProfileOpen ? "rotate-180" : "")} />
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 mb-2 bg-primary/5">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider">Connecté en tant que</p>
                                <p className="text-[10px] text-slate-500 dark:text-muted-foreground">{currentTenant?.role}</p>
                            </div>

                            <ul className="flex flex-col px-2 space-y-1">
                                <li>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center transition-colors text-red-500 hover:bg-red-500/10"
                                    >
                                        <LogOut className="h-4 w-4 mr-3" />
                                        <div className="font-bold">Déconnexion</div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
