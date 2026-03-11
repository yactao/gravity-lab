
const XLSX: any = { utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} }, writeFile: () => {} };
import { ArrowDownTrayIcon, ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

// CONFIGURATION STRICTE - SEULES CES COLONNES SERONT AFFICHÉES
const FINANCE_COLUMNS = [
  // ✅ NOUVEAU
  { key: "client", label: "Client", type: "text", width: "w-20" },
  { key: "annee", label: "Année", type: "number", width: "w-16" },

  { key: "magasin", label: "Magasin", type: "text", width: "w-28" },
  { key: "code_magasin", label: "Code", type: "text", width: "w-16" },
  { key: "dept", label: "Dépt", type: "text", width: "w-16" },
  { key: "ve_an", label: "VE", type: "number", width: "w-16" },
  { key: "montant_annuel", label: "Montant €", type: "currency", width: "w-24" },
  { key: "gv", label: "GV", type: "number", width: "w-16" },
  { key: "pv", label: "PV 1", type: "number", width: "w-16" },
  { key: "pv2", label: "PV 2", type: "number", width: "w-16" },
  { key: "pv3", label: "PV 3", type: "number", width: "w-16" },

  // Colonnes coûts
  { key: "preventive", label: "Préventive €", type: "currency", width: "w-24" },
  { key: "curative", label: "Curative €", type: "currency", width: "w-24" },
  {
    key: "total_preventive_curative",
    label: "Total (P + C) €",
    type: "currency",
    width: "w-28",
  },

  // ✅ NOUVEAU
  { key: "travaux", label: "Travaux €", type: "currency", width: "w-24" },
];

const normalizeRow = (row: Record<string, any>): Record<string, any> => {
  const base: Record<string, any> = { ...row };

  return {
    ...base,

    // ✅ NOUVEAU - Client
    client:
      base.client ??
      base.Client ??
      base["CLIENT"] ??
      base["Nom client"] ??
      base["Nom Client"] ??
      "-",

    // ✅ NOUVEAU - Année
    annee:
      base.annee ??
      base.Annee ??
      base["Année"] ??
      base["ANNEE"] ??
      base["Year"] ??
      "-",

    // Nom magasin
    magasin:
      base.magasin ??
      base.Magasins ??
      base.Magasin ??
      base["Magasin"] ??
      "-",

    // Code magasin
    code_magasin:
      base.code_magasin ??
      base["Code magasin"] ??
      base["Code_magasin"] ??
      base["Code"] ??
      "-",

    // Département
    dept:
      base.dept ??
      base["Dépt"] ??
      base["Dept"] ??
      base["Département"] ??
      base["Departement"] ??
      base["Département magasin"] ??
      "-",

    // VE / an
    ve_an:
      base.ve_an ??
      base["VE / an"] ??
      base.VE ??
      base["VE"] ??
      "-",

    // Montant annuel
    montant_annuel:
      base.montant_annuel ??
      base["Montant annuel"] ??
      base["Montant annuel (€)"] ??
      base["Montant annuel €"] ??
      "-",

    // GV
    gv: base.gv ?? base.GV ?? "-",

    // PV 1
    pv: base.pv ?? base.PV ?? "-",

    // PV 2 et PV 3 (compat PV.1 / PV.2)
    pv2: base.pv2 ?? base["PV.1"] ?? "-",
    pv3: base.pv3 ?? base["PV.2"] ?? "-",

    // Coûts
    preventive: base.preventive ?? base["Préventive"] ?? base["Preventive"] ?? "-",
    curative: base.curative ?? base["Curative"] ?? "-",
    total_preventive_curative:
      base.total_preventive_curative ??
      base["Total (Préventive+Curative)"] ??
      base["Total Préventive+Curative"] ??
      "-",

    // ✅ NOUVEAU - Travaux
    travaux:
      base.travaux ??
      base.Travaux ??
      base["TRAVAUX"] ??
      base["Travaux €"] ??
      "-",
  };
};

export default function FinanceTable({ data }: { data: Record<string, any>[] }) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700 rounded-xl text-xs">
        <p className="text-orange-800 dark:text-orange-200 text-center">
          Aucune donnée financière disponible
        </p>
      </div>
    );
  }

  const normalizedData = data.map(normalizeRow);

  const filteredData = normalizedData.map((row) => {
    const cleanRow: Record<string, any> = {};
    FINANCE_COLUMNS.forEach((col) => {
      cleanRow[col.key] = row[col.key] ?? "-";
    });
    return cleanRow;
  });

  const sortedData = [...filteredData];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === "-" || bVal === "-") return 0;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatValue = (value: any, columnType: string): string => {
    if (value === null || value === undefined || value === "-") return "-";

    try {
      switch (columnType) {
        case "currency":
          return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(Number(value));

        case "number":
          return new Intl.NumberFormat("fr-FR").format(Number(value));

        default:
          return String(value);
      }
    } catch {
      return String(value);
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = sortedData.map((row) => {
        const exportRow: Record<string, any> = {};
        FINANCE_COLUMNS.forEach((col) => {
          exportRow[col.label] = row[col.key];
        });
        return exportRow;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "AïnaFinance");
      XLSX.writeFile(wb, `AinaFinance_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
    }
  };

  // Totaux (sur les données normalisées)
  const totals = {
    montant_annuel: normalizedData.reduce(
      (sum, row) => sum + (Number(row.montant_annuel) || 0),
      0
    ),
    gv: normalizedData.reduce((sum, row) => sum + (Number(row.gv) || 0), 0),
    pv: normalizedData.reduce((sum, row) => sum + (Number(row.pv) || 0), 0),

    // ✅ NOUVEAU
    travaux: normalizedData.reduce(
      (sum, row) => sum + (Number(row.travaux) || 0),
      0
    ),

    count: normalizedData.length,
  };

  return (
    <div className="relative mt-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800/30 overflow-hidden backdrop-blur-sm">
      {/* En-tête */}
      <div className="relative p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-full blur-lg"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-purple-300 rounded-full blur-lg"></div>
        </div>

        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
              <span className="text-lg">💎</span>
            </div>
            <div>
              <h3 className="font-bold text-sm bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Analyse Financière
              </h3>
              <p className="text-blue-100 text-xs mt-0.5">
                {filteredData.length} magasins • MDM 2025
              </p>
            </div>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg border border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-md group text-xs"
          >
            <ArrowDownTrayIcon className="w-4 h-4 group-hover:animate-bounce" />
            <span className="font-semibold">Excel</span>
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900/20">
        <table className="min-w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {FINANCE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={`px-2 py-2 text-left font-bold text-white bg-blue-500 ${column.width}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{column.label}</span>
                    <div className="flex flex-col ml-1">
                      <ArrowsUpDownIcon className="w-2 h-2 opacity-100" />
                      {sortConfig?.key === column.key && (
                        <span className="text-[8px] mt-0.5">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b border-blue-50 dark:border-blue-900/30 transition-all duration-200 hover:scale-[1.01] ${
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-blue-50/50 dark:bg-blue-900/10"
                } hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20`}
              >
                {FINANCE_COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 transition-all duration-200 ${
                      column.type === "currency"
                        ? "font-bold text-sm text-green-600 dark:text-green-400"
                        : column.type === "number"
                        ? "font-semibold text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 font-medium"
                    } ${column.width}`}
                  >
                    <div className="transform hover:translate-x-0.5 transition-transform duration-200">
                      {formatValue(row[column.key], column.type)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pied avec stats */}
      <div className="p-2 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/10 border-t border-blue-100 dark:border-blue-800/30">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-700/30">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {totals.count}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Magasins
            </div>
          </div>

          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-green-100 dark:border-green-700/30">
            <div className="text-xs font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(totals.montant_annuel)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              CA Total
            </div>
          </div>

          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-purple-100 dark:border-purple-700/30">
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {new Intl.NumberFormat("fr-FR").format(totals.gv)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Total GV
            </div>
          </div>

          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-indigo-100 dark:border-indigo-700/30">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {new Intl.NumberFormat("fr-FR").format(totals.pv)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Total PV
            </div>
          </div>

          {/* ✅ NOUVEAU */}
          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-orange-100 dark:border-orange-700/30">
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(totals.travaux)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Total Travaux
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
