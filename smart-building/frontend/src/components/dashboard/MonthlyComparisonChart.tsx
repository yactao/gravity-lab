"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "next-themes";
import { useMemo } from "react";

interface MonthlyComparisonChartProps {
    data?: any[];
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Generate realistic comparative data showing energy savings
    const defaultData = useMemo(() => {
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        return months.map((month, index) => {
            // Base consumption higher in winter, lower in spring/autumn, high in summer (AC)
            const isWinter = index <= 2 || index >= 10;
            const isSummer = index >= 5 && index <= 7;

            let baseN1 = 3000 + Math.random() * 1000;
            if (isWinter) baseN1 += 2000;
            if (isSummer) baseN1 += 1500;

            // Current year shows 15-20% savings
            let baseN = baseN1 * (0.80 + Math.random() * 0.05);

            return {
                month,
                "Année N-1 (kWh)": Math.round(baseN1),
                "Année N (kWh)": Math.round(baseN)
            };
        });
    }, []);

    const chartData = data || defaultData;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                />
                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                />
                <Tooltip
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                        backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        color: isDark ? "#fff" : "#0f172a",
                        fontSize: "12px",
                        fontWeight: "bold"
                    }}
                    itemStyle={{ fontSize: "12px" }}
                />
                <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey="Année N-1 (kWh)"
                    fill={isDark ? "#334155" : "#cbd5e1"}
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                />
                <Bar
                    dataKey="Année N (kWh)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
