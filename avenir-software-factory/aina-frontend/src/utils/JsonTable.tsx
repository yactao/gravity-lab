
const XLSX: any = { utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} }, writeFile: () => {} };
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

export default function JsonTable({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p>Aucune donnée.</p>;

  const columns = Object.keys(data[0]);
  
  // Colonnes à MASQUER spécifiquement pour Aïna Finance
  const hiddenColumns = [
    "@search.score", 
    "id", 
    "client_name", 
    "period_start", 
    "period_end",
    "total_gv", 
    "total_pv", 
    "total_montant_annuel", 
    "source_workbook",
    "sheet_name", 
    "sheet_index", 
    "updated_at"
  ];
  
  // Filtrer pour garder seulement les colonnes à afficher
  const filteredColumns = columns.filter(col => !hiddenColumns.includes(col));

  // Fonction pour formater les noms de colonnes de manière plus lisible
  const formatColumnName = (column: string): string => {
    const formatMap: Record<string, string> = {
      'magasin': 'Magasin',
      'dept': 'Département',
      'code_magasin': 'Code Magasin',
      've_an': 'VE Annuel',
      'montant_annuel': 'Montant Annuel (€)',
      'gv': 'GV',
      'pv': 'PV'
    };
    
    return formatMap[column] || column.replace(/_/g, ' ').toUpperCase();
  };

  // Fonction pour formater les valeurs selon la colonne
  const formatValue = (column: string, value: any): string => {
    if (value === null || value === undefined) return '-';
    
    // Formater les montants avec séparateurs de milliers
    if (column === 'montant_annuel' || column === 'gv' || column === 'pv') {
      return new Intl.NumberFormat('fr-FR').format(value);
    }
    
    return value.toString();
  };

  const exportToExcel = async () => {
    // Préparer les données pour l'export avec les noms de colonnes formatés
    const exportData = data.map(row => {
      const exportRow: Record<string, any> = {};
      filteredColumns.forEach(col => {
        exportRow[formatColumnName(col)] = row[col];
      });
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AïnaFinance");
    XLSX.writeFile(wb, `AinaFinance_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="relative mt-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* En-tête avec titre et bouton d'export */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Données financières ({data.length} lignes)
          </h3>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors shadow-sm hover:shadow-md"
          title="Télécharger Excel"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Tableau avec scroll */}
      <div className="overflow-auto max-h-[400px] rounded-b-lg scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-800">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-indigo-600 text-white sticky top-0 z-10">
            <tr>
              {filteredColumns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium text-sm border-b border-indigo-500"
                >
                  {formatColumnName(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                {filteredColumns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-3 text-gray-800 dark:text-gray-200"
                  >
                    <div className="truncate max-w-[200px]" title={row[col]?.toString()}>
                      {formatValue(col, row[col])}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau avec résumé */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
          <span>Total: {data.length} magasins</span>
          <span>Colonnes affichées: {filteredColumns.length}</span>
        </div>
      </div>
    </div>
  );
}