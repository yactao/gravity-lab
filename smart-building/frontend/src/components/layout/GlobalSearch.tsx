"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Building, LayoutGrid, Cpu, Wifi, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/lib/TenantContext";
import { cn } from "@/lib/utils";

type SearchResult = {
    id: string;
    type: 'site' | 'zone' | 'sensor' | 'gateway' | 'organization';
    title: string;
    subtitle: string;
    url: string;
};

const iconMap = {
    site: Building,
    zone: LayoutGrid,
    sensor: Cpu,
    gateway: Wifi,
    organization: Building2,
};

export function GlobalSearch() {
    const router = useRouter();
    const { authFetch } = useTenant();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounce search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Ensure proper API URL, assuming process.env.NEXT_PUBLIC_API_URL or relative /api/search via proxy
                const res = await authFetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setIsOpen(true);
                    setSelectedIndex(0);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, authFetch]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setQuery("");
        }
    };

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery("");
        router.push(result.url);
    };

    return (
        <div className="flex items-center w-96 relative" ref={containerRef}>
            <div className="relative w-full group">
                <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                    isOpen ? "text-primary" : "text-slate-400 dark:text-muted-foreground group-focus-within:text-primary"
                )} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Rechercher (bâtiment, capteur, zone)..."
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-full pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden max-h-[400px] overflow-y-auto w-[450px]">
                    {results.length === 0 && !isLoading ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                            Aucun résultat trouvé pour "{query}"
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {results.map((result, idx) => {
                                const Icon = iconMap[result.type] || Search;
                                const isSelected = idx === selectedIndex;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(result)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={cn(
                                            "w-full flex items-center px-4 py-3 text-left transition-colors",
                                            isSelected
                                                ? "bg-slate-50 dark:bg-white/5"
                                                : "hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center mr-3 border transition-colors",
                                            isSelected
                                                ? "bg-primary/10 border-primary/30 text-primary"
                                                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500"
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-bold truncate transition-colors",
                                                isSelected ? "text-primary" : "text-slate-900 dark:text-white"
                                            )}>
                                                {result.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate mt-0.5">
                                                {result.subtitle}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
