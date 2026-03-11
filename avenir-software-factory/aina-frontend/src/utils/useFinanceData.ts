// hooks/useFinanceData.ts
import { useMemo } from 'react';

const ALLOWED_COLUMNS = ['magasin', 'code_magasin', 'dept', 've_an', 'montant_annuel', 'gv', 'pv'];

export function useFinanceData(rawData: Record<string, any>[]) {
  const filteredData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    return rawData.map(row => {
      const cleanRow: Record<string, any> = {};
      
      ALLOWED_COLUMNS.forEach(column => {
        // Garantir que seules les colonnes autorisées sont incluses
        cleanRow[column] = row[column] !== undefined ? row[column] : '-';
      });
      
      return cleanRow;
    });
  }, [rawData]);

  const totals = useMemo(() => ({
    montant_annuel: filteredData.reduce((sum, row) => sum + (Number(row.montant_annuel) || 0), 0),
    gv: filteredData.reduce((sum, row) => sum + (Number(row.gv) || 0), 0),
    pv: filteredData.reduce((sum, row) => sum + (Number(row.pv) || 0), 0),
    count: filteredData.length
  }), [filteredData]);

  return {
    filteredData,
    totals,
    allowedColumns: ALLOWED_COLUMNS
  };
}