"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    // Manage sidebar state globally for the layout
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <main
                className={`flex-1 relative transition-all duration-300 ease-in-out ${isCollapsed ? "lg:ml-[88px]" : "lg:ml-72"
                    }`}
            >
                <Header />
                <div className="pt-8 px-4 sm:px-8 pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
