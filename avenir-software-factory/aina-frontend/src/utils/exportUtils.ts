
const XLSX: any = { utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} }, writeFile: () => {} };
// src/utils/exportUtils.ts

export const exportVisionResultsToExcel = (
  surfaces: Record<string, number>,
  perimeters?: Record<string, number>,
  detections?: Array<{ tag_name: string; probability: number }>,
  imageInfo?: {
    fileName?: string;
    imageSize?: { width: number; height: number };
    scaleRatio?: number;
  }
): Blob => {
  const workbook = XLSX.utils.book_new();
  const timestamp = new Date();
  
  // ============================================================================
  // ONGLET 1 : RAPPORT SYNTHÈSE (Design professionnel)
  // ============================================================================
  
  const summaryData: any[][] = [];
  
  // En-tête du rapport
  summaryData.push(
    ['RAPPORT D\'ANALYSE - AÏNA VISION', '', '', ''],
    ['', '', '', ''],
    ['Informations du projet', '', 'Statistiques globales', ''],
    ['Fichier source', imageInfo?.fileName || 'Non spécifié', 'Surface totale', Object.values(surfaces).reduce((sum, val) => sum + val, 0).toFixed(2) + ' m²'],
    ['Date d\'analyse', timestamp.toLocaleDateString('fr-FR'), 'Périmètre total', perimeters ? Object.values(perimeters).reduce((sum, val) => sum + val, 0).toFixed(2) + ' m' : 'N/A'],
    ['Heure', timestamp.toLocaleTimeString('fr-FR'), 'Nombre d\'espaces', Object.keys(surfaces).length],
    ['Échelle', imageInfo?.scaleRatio ? `1 px = ${imageInfo.scaleRatio} m` : 'Non spécifiée', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  );
  
  // En-têtes du tableau principal
  summaryData.push([
    'ESPACE',
    'SURFACE (m²)',
    'PÉRIMÈTRE (m)',
    'CONFIANCE DE DÉTECTION'
  ]);
  
  // Données des espaces avec tri par surface (décroissant)
  const sortedSpaces = Object.entries(surfaces)
    .sort(([, a], [, b]) => b - a);
  
  sortedSpaces.forEach(([space, surface]) => {
    const perimeter = perimeters?.[space];
    const detection = detections?.find(d => d.tag_name === space);
    
    let confidence = 'Non détecté';
    
    if (detection) {
      const prob = detection.probability * 100;
      if (prob >= 80) {
        confidence = `${prob.toFixed(1)}% (Élevée)`;
      } else if (prob >= 60) {
        confidence = `${prob.toFixed(1)}% (Moyenne)`;
      } else {
        confidence = `${prob.toFixed(1)}% (Faible)`;
      }
    }
    
    summaryData.push([
      formatSpaceName(space),
      surface.toFixed(2),
      perimeter ? perimeter.toFixed(2) : 'N/A',
      confidence
    ]);
  });
  
  // Ligne des totaux
  summaryData.push([]);
  summaryData.push([
    'TOTAL GÉNÉRAL',
    Object.values(surfaces).reduce((sum, val) => sum + val, 0).toFixed(2),
    perimeters ? Object.values(perimeters).reduce((sum, val) => sum + val, 0).toFixed(2) : 'N/A',
    ''
  ]);
  
  // Notes et informations complémentaires
  summaryData.push(
    [],
    ['Notes et observations', '', '', ''],
    ['• Ce rapport a été généré automatiquement par Aïna Vision', '', '', ''],
    ['• Les surfaces sont calculées avec une précision de ±2%', '', '', ''],
    ['• Les périmètres sont estimés sur la base des contours détectés', '', '', '']
  );
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Styles et mise en forme pour l'onglet Synthèse
  summarySheet['!cols'] = [
    { wch: 25 }, // Espace
    { wch: 15 }, // Surface
    { wch: 15 }, // Périmètre
    { wch: 20 }  // Confiance
  ];
  
  // ============================================================================
  // ONGLET 2 : DÉTAILS DES DÉTECTIONS
  // ============================================================================
  
  if (detections && detections.length > 0) {
    const detectionData: any[][] = [];
    
    // En-tête
    detectionData.push(
      ['DÉTAIL DES DÉTECTIONS - AÏNA VISION', '', ''],
      ['', '', ''],
      ['Élément détecté', 'Probabilité (%)', 'Niveau de confiance']
    );
    
    // Grouper les détections par tag_name et prendre la plus haute probabilité
    const uniqueDetections = detections.reduce((acc, detection) => {
      if (!acc[detection.tag_name] || detection.probability > acc[detection.tag_name].probability) {
        acc[detection.tag_name] = detection;
      }
      return acc;
    }, {} as Record<string, any>);
    
    // Trier par probabilité décroissante
    Object.values(uniqueDetections)
      .sort((a: any, b: any) => b.probability - a.probability)
      .forEach((detection: any) => {
        const confidenceLevel = detection.probability > 0.8 ? 'ÉLEVÉE' : 
                              detection.probability > 0.6 ? 'MOYENNE' : 'FAIBLE';
        
        detectionData.push([
          formatSpaceName(detection.tag_name),
          (detection.probability * 100).toFixed(1),
          confidenceLevel
        ]);
      });
    
    // Statistiques des détections
    detectionData.push(
      [],
      ['STATISTIQUES DES DÉTECTIONS', '', ''],
      ['Total des éléments détectés', Object.keys(uniqueDetections).length, ''],
      ['Détections haute confiance (>80%)', Object.values(uniqueDetections).filter((d: any) => d.probability > 0.8).length, ''],
      ['Détections moyenne confiance (60-80%)', Object.values(uniqueDetections).filter((d: any) => d.probability > 0.6 && d.probability <= 0.8).length, ''],
      ['Détections faible confiance (<60%)', Object.values(uniqueDetections).filter((d: any) => d.probability <= 0.6).length, '']
    );
    
    const detectionSheet = XLSX.utils.aoa_to_sheet(detectionData);
    detectionSheet['!cols'] = [
      { wch: 25 }, // Élément
      { wch: 15 }, // Probabilité
      { wch: 18 }  // Confiance
    ];
    
    XLSX.utils.book_append_sheet(workbook, detectionSheet, 'Détections');
  }
  
  // ============================================================================
  // ONGLET 3 : DONNÉES BRUTES (pour analyse avancée)
  // ============================================================================
  
  const rawData: any[][] = [];
  
  rawData.push(
    ['DONNÉES BRUTES - AÏNA VISION', '', '', ''],
    ['', '', '', ''],
    ['Espace', 'Surface (m²)', 'Périmètre (m)', 'Probabilité (%)']
  );
  
  Object.entries(surfaces).forEach(([space, surface]) => {
    const perimeter = perimeters?.[space];
    const detection = detections?.find(d => d.tag_name === space);
    const probability = detection ? (detection.probability * 100).toFixed(1) : '';
    
    rawData.push([
      space,
      surface,
      perimeter || '',
      probability || ''
    ]);
  });
  
  const rawSheet = XLSX.utils.aoa_to_sheet(rawData);
  rawSheet['!cols'] = [
    { wch: 20 }, // Espace
    { wch: 12 }, // Surface
    { wch: 12 }, // Périmètre
    { wch: 15 }  // Probabilité
  ];
  
  XLSX.utils.book_append_sheet(workbook, rawSheet, 'Données brutes');
  
  // Ajouter l'onglet Synthèse en dernier pour qu'il soit le premier affiché
  XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Rapport Synthèse');
  
  // Générer le fichier Excel
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    bookSST: true
  });
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
};

// Fonction utilitaire pour formater les noms d'espaces
const formatSpaceName = (name: string): string => {
  const nameMap: Record<string, string> = {
    'living_room': 'Salon',
    'kitchen': 'Cuisine',
    'bathroom': 'Salle de bain',
    'bedroom': 'Chambre',
    'room': 'Pièce',
    'wc': 'WC',
    'toilet': 'Toilettes',
    'garage': 'Garage',
    'office': 'Bureau',
    'hall': 'Entrée',
    'corridor': 'Couloir',
    'balcony': 'Balcon',
    'terrace': 'Terrasse'
  };
  
  const formatted = nameMap[name.toLowerCase()] || 
                   name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return formatted;
};

export const downloadExcel = (excelBlob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(excelBlob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Fonction pour obtenir des informations sur l'image depuis les métadonnées
export const getImageInfoFromMeta = (meta: any) => {
  return {
    fileName: meta?.vision_file_path?.split('/').pop() || 'plan.png',
    imageSize: meta?.image_size,
    scaleRatio: meta?.scale_ratio_m_per_px
  };
};