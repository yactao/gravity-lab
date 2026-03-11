
const XLSX: any = { utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} }, writeFile: () => {} };
import { ArrowDownTrayIcon, ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

type VetRow = Record<string, any>;

// Colonnes spécifiques Vet Finance
const VET_FINANCE_COLUMNS = [
  { key: "mois", label: "Mois", type: "text", width: "w-20" },
  { key: "consultations", label: "Consultations", type: "number", width: "w-24" },
  { key: "chirurgies", label: "Chirurgies", type: "number", width: "w-24" },
  { key: "vaccinations", label: "Vaccinations", type: "number", width: "w-24" },
  { key: "hospitalisation", label: "Hospitalisation", type: "number", width: "w-28" },
  { key: "vente_produits", label: "Vente produits", type: "number", width: "w-28" },
  { key: "urgences", label: "Urgences", type: "number", width: "w-20" },
  { key: "divers", label: "Divers", type: "number", width: "w-20" },
];

// Normalisation pour accepter soit les clés déjà normalisées
// soit les en-têtes Excel français
const normalizeVetRow = (row: VetRow): VetRow => {
  const base: VetRow = { ...row };

  return {
    ...base,

    mois:
      base.mois ??
      base.Mois ??
      "-",

    consultations:
      base.consultations ??
      base.Consultations ??
      0,

    chirurgies:
      base.chirurgies ??
      base.Chirurgies ??
      0,

    vaccinations:
      base.vaccinations ??
      base.Vaccinations ??
      0,

    hospitalisation:
      base.hospitalisation ??
      base.Hospitalisation ??
      0,

    vente_produits:
      base.vente_produits ??
      base["Vente produits"] ??
      base["Vente_produits"] ??
      0,

    urgences:
      base.urgences ??
      base.Urgences ??
      0,

    divers:
      base.divers ??
      base.Divers ??
      0,
  };
};

interface VetFinanceTableProps {
  data: VetRow[];
}

export default function VetFinanceTable({ data }: VetFinanceTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs">
        <p className="text-emerald-800 dark:text-emerald-200 text-center">
          Aucune donnée vétérinaire disponible
        </p>
      </div>
    );
  }

  // 1) Normalisation
  const normalizedData = data.map(normalizeVetRow);

  // 2) On ne garde que les colonnes définies
  const filteredData = normalizedData.map((row) => {
    const cleanRow: VetRow = {};
    VET_FINANCE_COLUMNS.forEach((col) => {
      cleanRow[col.key] = row[col.key] ?? (col.type === "text" ? "-" : 0);
    });
    return cleanRow;
  });

  // 3) Tri
  const sortedData = [...filteredData];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Texte pour "Mois", nombre pour le reste
      if (sortConfig.key === "mois") {
        const aStr = String(aVal);
        const bStr = String(bVal);
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }

      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      if (aNum < bNum) return sortConfig.direction === "asc" ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return "-";

    if (type === "number") {
      try {
        return new Intl.NumberFormat("fr-FR").format(Number(value));
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  const exportToExcel = () => {
    try {
      const exportData = sortedData.map((row) => {
        const exportRow: Record<string, any> = {};
        VET_FINANCE_COLUMNS.forEach((col) => {
          exportRow[col.label] = row[col.key];
        });
        return exportRow;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "AinaVetFinance");
      XLSX.writeFile(
        wb,
        `AinaVetFinance_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel Vet:", error);
    }
  };

  // 4) Totaux
  const totals = {
    consultations: normalizedData.reduce(
      (sum, row) => sum + (Number(row.consultations) || 0),
      0
    ),
    chirurgies: normalizedData.reduce(
      (sum, row) => sum + (Number(row.chirurgies) || 0),
      0
    ),
    vaccinations: normalizedData.reduce(
      (sum, row) => sum + (Number(row.vaccinations) || 0),
      0
    ),
    hospitalisation: normalizedData.reduce(
      (sum, row) => sum + (Number(row.hospitalisation) || 0),
      0
    ),
    vente_produits: normalizedData.reduce(
      (sum, row) => sum + (Number(row.vente_produits) || 0),
      0
    ),
    urgences: normalizedData.reduce(
      (sum, row) => sum + (Number(row.urgences) || 0),
      0
    ),
    divers: normalizedData.reduce(
      (sum, row) => sum + (Number(row.divers) || 0),
      0
    ),
    count: normalizedData.length,
  };

  return (
    <div className="relative mt-4 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/10 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-800/30 overflow-hidden backdrop-blur-sm">
      {/* En-tête */}
      <div className="relative p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-full blur-lg"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-cyan-300 rounded-full blur-lg"></div>
        </div>

        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
              <span className="text-lg">🐾</span>
            </div>
            <div>
              <h3 className="font-bold text-sm bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                Activité vétérinaire
              </h3>
              <p className="text-emerald-50 text-xs mt-0.5">
                {filteredData.length} mois analysés
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
      <div className="overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50 dark:scrollbar-thumb-emerald-600 dark:scrollbar-track-emerald-900/20">
        <table className="min-w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {VET_FINANCE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={`px-2 py-2 text-left font-bold text-white bg-emerald-500 ${column.width} cursor-pointer`}
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
                className={`border-b border-emerald-50 dark:border-emerald-900/30 transition-all duration-200 hover:scale-[1.01] ${
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-emerald-50/50 dark:bg-emerald-900/10"
                } hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20`}
              >
                {VET_FINANCE_COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 transition-all duration-200 ${
                      column.type === "number"
                        ? "font-semibold text-emerald-700 dark:text-emerald-300"
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

      {/* Pied avec stats globales */}
      <div className="p-2 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/10 border-t border-emerald-100 dark:border-emerald-800/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-emerald-100 dark:border-emerald-700/30">
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {totals.count}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Mois
            </div>
          </div>

          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-700/30">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {new Intl.NumberFormat("fr-FR").format(totals.consultations)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Consultations
            </div>
          </div>

          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-fuchsia-100 dark:border-fuchsia-700/30">
            <div className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">
              {new Intl.NumberFormat("fr-FR").format(totals.chirurgies)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Chirurgies
            </div>
          </div>

          <div className="text-center p-1 bg-white dark:bg-gray-800 rounded-md border border-amber-100 dark:border-amber-700/30">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {new Intl.NumberFormat("fr-FR").format(totals.urgences)}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
              Urgences
            </div>
          </div>
        </div>

        <div className="mt-1 flex justify-center gap-3 text-[9px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded"></div>
            <span>Actes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded"></div>
            <span>Consultations</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded"></div>
            <span>Urgences</span>
          </div>
        </div>
      </div>
    </div>
  );
}
