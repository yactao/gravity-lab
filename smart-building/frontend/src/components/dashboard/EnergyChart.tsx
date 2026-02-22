"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Reading {
    id: string;
    value: number;
    timestamp: string;
    sensor: {
        type: string;
        unit: string;
    };
}

interface EnergyChartProps {
    data: Reading[];
}

export function EnergyChart({ data }: EnergyChartProps) {
    // Process raw readings into timeline data points
    const chartData = useMemo(() => {
        return data
            .filter((r) => r.sensor?.type === "energy")
            .map((r) => ({
                time: new Date(r.timestamp),
                label: format(new Date(r.timestamp), "HH:mm:ss"),
                power: r.value,
            }))
            .sort((a, b) => a.time.getTime() - b.time.getTime()); // Chronological order
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-muted-foreground">
                En attente de données...
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.8)",
                        borderColor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "8px",
                        color: "#fff"
                    }}
                    itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                    formatter={(value: any) => [`${Number(value).toFixed(0)} W`, "Conso."]}
                    labelFormatter={(label) => `Heure: ${label}`}
                />
                <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPower)"
                    isAnimationActive={false} // Disable animation to prevent visual glitches on tick updates
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
