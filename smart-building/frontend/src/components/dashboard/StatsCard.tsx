import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color?: "cyan" | "purple" | "orange" | "green" | "red";
}

const colorMap = {
    cyan: "from-cyan-500/20 to-blue-500/20 text-cyan-500",
    purple: "from-purple-500/20 to-pink-500/20 text-purple-500",
    orange: "from-orange-500/20 to-red-500/20 text-orange-500",
    green: "from-emerald-500/20 to-green-500/20 text-emerald-500",
    red: "from-red-500/20 to-red-700/20 text-red-500",
};

export function StatsCard({ title, value, trend, trendUp, icon: Icon, color = "cyan" }: StatsCardProps) {
    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 group-hover:scale-105 transition-transform origin-left">
                        {value}
                    </h3>
                </div>
                <div className={cn("p-3 rounded-xl bg-gradient-to-br", colorMap[color])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-xs">
                    <span className={cn(
                        "font-medium px-1.5 py-0.5 rounded",
                        trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                    )}>
                        {trend}
                    </span>
                    <span className="text-slate-500 dark:text-muted-foreground ml-2">vs mois dernier</span>
                </div>
            )}

            {/* Decorative Blur */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-opacity"></div>
        </div>
    );
}
