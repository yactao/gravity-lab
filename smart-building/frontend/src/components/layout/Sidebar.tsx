"use client";

import { LayoutDashboard, Briefcase, BarChart2, Wifi, CloudUpload, Settings, FileText, Receipt, Hexagon, ChevronDown, Sparkles, AlertTriangle, Map } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/TenantContext";

type NavItemType = {
    name: string;
    href?: string;
    icon: any;
    hasSub?: boolean;
    subItems?: { name: string; href: string }[];
};

const navItems: NavItemType[] = [
    { name: "Accueil", href: "/", icon: LayoutDashboard },
    { name: "Gestion de Parc", href: "/clients", icon: Briefcase },
    { name: "Carte Globale", href: "/map", icon: Hexagon }, // Utilisation de l'icône de carte pour l'instant
    { name: "Rapports Énergétiques", href: "/energy", icon: BarChart2 },
    { name: "Network Monitoring", href: "/network", icon: Wifi },
    { name: "Appairage IoT", href: "/onboarding", icon: CloudUpload },
    { name: "Générateur de Règles", href: "/rules", icon: Sparkles },
    { name: "Alertes & Maintenance", href: "/alerts", icon: AlertTriangle },
    { name: "Paramétrage", href: "/settings", icon: Settings, hasSub: true },
    { name: "Licence", href: "/license", icon: FileText, hasSub: true },
    { name: "Facturation", href: "/billing", icon: Receipt },
];

export function Sidebar() {
    const pathname = usePathname();
    const { currentTenant } = useTenant();
    const [expanded, setExpanded] = useState<string | null>(null);

    if (!currentTenant) return null;

    const filteredNavItems = navItems.map(item => {
        // Dynamic href for "Gestion de Parc" based on role
        if (item.name === "Gestion de Parc") {
            return {
                ...item,
                href: currentTenant.role === "CLIENT" ? "/sites" : "/clients"
            };
        }
        return item;
    }).filter((item) => {
        if (currentTenant.role === "CLIENT") {
            if (item.href && ["/rules", "/network", "/settings", "/license", "/onboarding"].includes(item.href)) {
                return false;
            }
        }
        return true;
    });

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 flex flex-col z-50 transition-colors">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/5">
                <Hexagon className="h-6 w-6 text-primary mr-2 stroke-[1.5]" />
                <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent leading-tight mt-1">
                        UBBEE
                    </span>
                    <span className="text-[9px] font-semibold text-primary/100 dark:text-primary/80 uppercase tracking-widest mt-0.5">
                        BY IOTEVA
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {filteredNavItems.map((item) => {
                    if (item.subItems) {
                        const isExpanded = expanded === item.name;
                        const isChildActive = item.subItems.some((sub: any) => pathname === sub.href || (sub.href !== "/" && pathname.startsWith(sub.href)));
                        return (
                            <div key={item.name} className="flex flex-col space-y-1 mb-1">
                                <button
                                    onClick={() => setExpanded(isExpanded ? null : item.name)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group w-full",
                                        isChildActive && !isExpanded
                                            ? "bg-primary/5 text-primary border border-primary/10"
                                            : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <item.icon className={cn(
                                            "h-5 w-5 mr-3 transition-colors",
                                            isChildActive ? "text-primary" : "text-slate-400 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-white"
                                        )} />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform",
                                        isExpanded ? "rotate-180 text-slate-900 dark:text-white" : "text-slate-400 dark:text-muted-foreground/50 group-hover:text-slate-900 dark:group-hover:text-white"
                                    )} />
                                </button>
                                {isExpanded && (
                                    <div className="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-white/10 space-y-1">
                                        {item.subItems.map((subItem: any) => {
                                            const isSubActive = pathname === subItem.href || (subItem.href !== "/" && pathname.startsWith(subItem.href));
                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className={cn(
                                                        "flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                                        isSubActive
                                                            ? "bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                                            : "text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    {subItem.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isActive = item.href ? (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) : false;
                    return (
                        <Link
                            key={item.name}
                            href={item.href || "#"}
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className={cn(
                                    "h-5 w-5 mr-3 transition-colors",
                                    isActive ? "text-primary" : "text-slate-400 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-white"
                                )} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            {item.hasSub && (
                                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-muted-foreground/50 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
