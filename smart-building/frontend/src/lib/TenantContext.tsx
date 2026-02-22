"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "SUPER_ADMIN" | "ENERGY_MANAGER" | "CLIENT";

export interface Tenant {
    id: string; // The database organizationId
    name: string;
    role: Role;
    userId: string;
    userName: string;
}

interface TenantContextType {
    currentTenant: Tenant | null;
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    switchTenant: (orgId: string, orgName: string) => void;
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Restore session from localStorage if exists
        const savedToken = localStorage.getItem("smartbuild_token");
        const savedTenant = localStorage.getItem("smartbuild_user");

        if (savedToken && savedTenant) {
            try {
                setToken(savedToken);
                setCurrentTenantState(JSON.parse(savedTenant));
            } catch (e) { }
        } else if (pathname !== '/login') {
            router.push('/login');
        }
        setMounted(true);
    }, [pathname, router]);

    const login = (newToken: string, user: any) => {
        const tenantUser: Tenant = {
            id: user.organizationId || "11111111-1111-1111-1111-111111111111",
            name: user.organizationName || "Global",
            role: user.role,
            userId: user.sub,
            userName: user.name || user.email
        };

        setToken(newToken);
        setCurrentTenantState(tenantUser);
        localStorage.setItem("smartbuild_token", newToken);
        localStorage.setItem("smartbuild_user", JSON.stringify(tenantUser));
    };

    const logout = () => {
        setToken(null);
        setCurrentTenantState(null);
        localStorage.removeItem("smartbuild_token");
        localStorage.removeItem("smartbuild_user");
        router.push('/login');
    };

    const switchTenant = (orgId: string, orgName: string) => {
        if (!currentTenant) return;
        const switchedTenant = { ...currentTenant, id: orgId, name: orgName };
        setCurrentTenantState(switchedTenant);
        localStorage.setItem("smartbuild_user", JSON.stringify(switchedTenant));

        // Refresh page to apply new context everywhere
        window.location.reload();
    };

    // Pre-configured fetch wrapper that injects headers
    const authFetch = async (url: string, options: RequestInit = {}) => {
        const headers: any = {
            ...options.headers,
            "Content-Type": "application/json"
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        if (currentTenant) {
            headers["x-organization-id"] = currentTenant.id;
            headers["x-user-role"] = currentTenant.role;
        }

        const res = await fetch(url, { ...options, headers });
        if (res.status === 401 && pathname !== '/login') {
            logout(); // Auto logout on token expiration
        }
        return res;
    };

    if (!mounted) return null; // Avoid hydration mismatch

    // Prevent rendering protected pages if completely unauthenticated
    if (pathname !== '/login' && (!currentTenant || !token)) {
        return null;
    }

    return (
        <TenantContext.Provider value={{ currentTenant, token, login, logout, switchTenant, authFetch }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) throw new Error("useTenant must be used within TenantProvider");
    return context;
}
