"use client";

import { useState } from "react";
import { Receipt, DownloadCloud, CreditCard, Calendar, FileText, CheckCircle2, ChevronRight, Clock } from "lucide-react";

// Mock data for invoices
const INVOICES = [
    { id: "INV-2023-11", date: "01 Nov 2023", amount: "499.00", status: "payé", pdflink: "#" },
    { id: "INV-2023-10", date: "01 Oct 2023", amount: "499.00", status: "payé", pdflink: "#" },
    { id: "INV-2023-09", date: "01 Sep 2023", amount: "450.00", status: "payé", pdflink: "#" },
    { id: "INV-2023-08", date: "01 Aou 2023", amount: "450.00", status: "payé", pdflink: "#" },
    { id: "INV-2023-07", date: "01 Jui 2023", amount: "450.00", status: "payé", pdflink: "#" },
];

export default function BillingPage() {
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    const handleDownload = (id: string) => {
        setIsDownloading(id);
        setTimeout(() => setIsDownloading(null), 1500);
    };

    return (
        <div className="max-w-5xl mx-auto pt-8 pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                    <Receipt className="h-8 w-8 text-primary mr-3" />
                    Facturation & Paiements
                </h1>
                <p className="text-slate-500 dark:text-muted-foreground mb-8">Consultez votre historique de facturation, gérez vos moyens de paiement et téléchargez vos justificatifs comptables.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Payment Method */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-2xl p-6 bg-slate-900 dark:bg-[#0B1120] border border-slate-800 dark:border-white/10 relative overflow-hidden group">
                        {/* Visa Card Design */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <CreditCard className="text-slate-400 w-8 h-8" />
                            <div className="text-right">
                                <span className="text-white font-bold tracking-widest text-lg italic pointer-events-none">VISA</span>
                            </div>
                        </div>
                        <div className="text-xl font-mono text-white tracking-[0.2em] mb-4 relative z-10">•••• •••• •••• 4242</div>
                        <div className="flex justify-between text-slate-400 text-xs font-mono relative z-10">
                            <span>EXP 12/25</span>
                            <span>CVC ***</span>
                        </div>
                    </div>

                    <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors text-sm border border-slate-200 dark:border-white/10 cursor-pointer">
                        Mettre à jour le moyen de paiement
                    </button>
                </div>

                {/* Upcoming invoice */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-2xl p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 h-full flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none"></div>

                        <div className="flex items-center text-primary font-bold text-sm uppercase tracking-widest mb-4">
                            <Clock className="w-4 h-4 mr-2" /> Prochain Prélèvement
                        </div>

                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">499.00 €</div>
                                <div className="text-slate-500 dark:text-muted-foreground mt-1 text-sm">TTC (TVA 20% incluse)</div>
                            </div>
                            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-semibold flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                01 Déc 2023
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-muted-foreground">Ce montant correspond à l'abonnement mensuel de votre formule Enterprise. La facture sera automatiquement générée après le prélèvement.</p>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Historique des Factures</h2>
            <div className="glass-card rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-black/30 text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground border-b border-slate-200 dark:border-white/10">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">N° Facture</th>
                                <th className="p-4 font-semibold">Montant</th>
                                <th className="p-4 font-semibold">Statut</th>
                                <th className="p-4 font-semibold text-right">Document</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {INVOICES.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-slate-900 dark:text-white font-medium">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                            {inv.date}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-sm">
                                        {inv.id}
                                    </td>
                                    <td className="p-4 text-slate-900 dark:text-white font-bold">
                                        {inv.amount} €
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDownload(inv.id)}
                                            className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-semibold rounded-lg transition-colors"
                                        >
                                            {isDownloading === inv.id ? (
                                                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 dark:border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <DownloadCloud className="w-4 h-4 mr-2" />
                                                    PDF
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 text-center border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <button className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-muted-foreground dark:hover:text-white transition-colors flex items-center justify-center w-full">
                        Voir les années précédentes <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
