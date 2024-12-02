export const translations = {
  en: {
    dashboard: {
      title: 'Activity Dashboard',
      totalTime: 'Total Time',
      avgActiveDuration: 'Avg Active Duration',
      totalEmployees: 'Total Employees',
      busiestRegion: 'Busiest Region',
      activityDistribution: 'Activity Distribution',
      employeeActivity: 'Employee Activity',
      peakActivityTimes: 'Peak Activity Times',
      regionHeatmap: 'Region Heat Map',
      activityTimeline: 'Activity Timeline',
      compare: 'Compare',
      selectDates: 'Select dates',
      selectEmployee: 'Select employee',
      allEmployees: 'All employees',
      loadingDashboard: 'Loading dashboard...',
      preparingAnalytics: 'Preparing analytics...',
      hoursAbbreviation: 'h',
      vsText: 'vs',
      tooltips: {
        totalTime: 'Total hours across all activities and employees',
        avgDuration: 'Average duration of activity for employee shifts',
        totalEmployees: 'Total number of unique employees',
        busiestRegion: 'Region with the most activity hours'
      }
    },
    settings: {
      title: 'Dashboard Settings',
      activities: 'Activities',
      dates: 'Dates',
      charts: 'Charts',
      colors: 'Colors',
      visibleActivities: 'Visible Activities',
      dateSelection: 'Date Selection',
      compareMode: 'Compare Mode',
      visibleCharts: 'Visible Charts'
    },
    common: {
      settings: 'Settings',
      dashboard: 'Dashboard',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      comparison: {
        vs: 'vs',
      },
      chart: {
        noLabel: 'No label',
      },
    },
    fileUploader: {
      title: 'Upload Warehouse Activity Data',
      clearFiles: 'Clear Files',
      dropHere: 'Drop the files here...',
      dragAndDrop: 'Drag and drop files here, or click to select',
      layoutImage: 'Layout Image (PNG)',
      processMetadata: 'Process Metadata (JSON)',
      warehouseActivity: 'Warehouse Activity (JSON)',
      processing: 'Processing files...',
      selectFiles: 'Select Files',
      uploadAllFiles: 'Please upload all required files before proceeding',
      uploaded: 'uploaded'
    },
    timeline: {
      play: 'Play',
      pause: 'Pause',
      playTooltip: 'Start timeline playback',
      pauseTooltip: 'Pause timeline playback',
      speedTooltip: 'Set playback speed to {{speed}}x',
      currentTime: 'Current timeline position',
      timelineSlider: 'Timeline position slider',
      noDataAvailable: 'No dates available for timeline visualization',
      selectDate: 'Select date',
      employee: 'Employee {{id}}',
      noActivities: 'No activities at this time',
    },
    heatmap: {
      title: 'Activity Heat Maps',
      showInstances: 'Show Instances',
      colorIntensityInfo: 'Color intensity indicates relative {{type}} of activities in each region.',
      instancesNote: 'Only instances longer than 5 seconds are counted.',
      darkerColors: 'Darker colors represent higher values.',
      frequency: 'frequency',
      duration: 'duration'
    },
    heatmapTooltip: {
      duration: 'Duration',
      totalInstances: 'Total Instances', 
      percentageTotal: '% of Total',
      seconds: 'sec',
      greaterThan: '>'
    },
    activityTooltip: {
      value: 'Value',  
      comparison: 'Comparison',  
      total: 'Total',
      selected: 'Selected Period',        
    },
    warehouseCanvas: {
      loadingError: 'Failed to load layout image',
      tooltip: {
        activity: 'Activity: {{activity}}',
        employee: 'Employee: {{id}}',
        region: 'Region: {{name}}'
      }
    },
    charts: {
      activityDistribution: {
        title: 'Activity Distribution',   
        hoursLabel: 'Hours',  
        hours: 'h'
      },
      heatmap: {
        activityIntensity: 'Activity Intensity',
      }
    },
  },
  de: {
    dashboard: {
      title: 'Aktivitäts-Dashboard',
      totalTime: 'Gesamtzeit',
      avgActiveDuration: 'Durchschn. aktive Dauer',
      totalEmployees: 'Gesamtanzahl Mitarbeiter', 
      busiestRegion: 'Aktivste Region',
      activityDistribution: 'Aktivitätsverteilung',
      employeeActivity: 'Mitarbeiteraktivität',
      peakActivityTimes: 'Hauptaktivitätszeiten',
      regionHeatmap: 'Regionale Heatmap',
      activityTimeline: 'Aktivitätszeitstrahl',
      compare: 'Vergleichen',
      selectDates: 'Daten auswählen',
      selectEmployee: 'Mitarbeiter auswählen',
      allEmployees: 'Alle Mitarbeiter',
      loadingDashboard: 'Dashboard wird geladen...',
      preparingAnalytics: 'Analysen werden vorbereitet...',
      hoursAbbreviation: 'Std',
      vsText: 'vs',
      tooltips: {
        totalTime: 'Gesamtstunden über alle Aktivitäten und Mitarbeiter',
        avgDuration: 'Durchschnittliche Dauer der Aktivität pro Mitarbeiterschicht',
        totalEmployees: 'Gesamtanzahl der einzelnen Mitarbeiter',
        busiestRegion: 'Region mit den meisten Aktivitätsstunden'
      }
    },
    settings: {
      title: 'Dashboard-Einstellungen',
      activities: 'Aktivitäten',
      dates: 'Daten',
      charts: 'Diagramme',
      colors: 'Farben',
      visibleActivities: 'Sichtbare Aktivitäten',
      dateSelection: 'Datumsauswahl',
      compareMode: 'Vergleichsmodus',
      visibleCharts: 'Sichtbare Diagramme'
    },
    common: {
      settings: 'Einstellungen',
      dashboard: 'Dashboard',
      save: 'Speichern',
      cancel: 'Abbrechen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      comparison: {
        vs: 'vs',
      },
      chart: {
        noLabel: 'Kein Label',
      },
    },
    fileUploader: {
      title: 'Lageraktivitätsdaten hochladen',
      clearFiles: 'Dateien löschen',
      dropHere: 'Dateien hier ablegen...',
      dragAndDrop: 'Dateien hier ablegen oder klicken zum Auswählen',
      layoutImage: 'Layout-Bild (PNG)',
      processMetadata: 'Prozess-Metadaten (JSON)',
      warehouseActivity: 'Lageraktivität (JSON)',
      processing: 'Dateien werden verarbeitet...',
      selectFiles: 'Dateien auswählen',
      uploadAllFiles: 'Bitte laden Sie alle erforderlichen Dateien hoch, bevor Sie fortfahren',
      uploaded: 'hochgeladen'
    },
    timeline: {
      play: 'Abspielen',
      pause: 'Pause',
      playTooltip: 'Zeitachse abspielen',
      pauseTooltip: 'Zeitachse pausieren',
      speedTooltip: 'Geschwindigkeit auf {{speed}}x setzen',
      currentTime: 'Aktuelle Zeitposition',
      timelineSlider: 'Zeitachsen-Positionsregler',
      noDataAvailable: 'Keine Daten für die Zeitachsenvisualisierung verfügbar',
      selectDate: 'Datum auswählen',
      employee: 'Mitarbeiter {{id}}',
      noActivities: 'Keine Aktivitäten zu diesem Zeitpunkt',
    },
    heatmap: {
      title: 'Aktivitäts-Heatmaps',
      showInstances: 'Instanzen anzeigen',
      colorIntensityInfo: 'Farbintensität zeigt relative {{type}} der Aktivitäten in jeder Region.',
      instancesNote: 'Nur Instanzen länger als 5 Sekunden werden gezählt.',
      darkerColors: 'Dunklere Farben stellen höhere Werte dar.',
      frequency: 'Häufigkeit',
      duration: 'Dauer'
    },
    heatmapTooltip: {
      duration: 'Dauer',
      totalInstances: 'Gesamtinstanzen', 
      percentageTotal: '% des Gesamts',
      seconds: 'Sek',
      greaterThan: '>'
    },
    activityTooltip: {
      value: 'Wert',
      comparison: 'Vergleich',
      total: 'Gesamt',
      selected: 'Ausgewählter Zeitraum',
    },    
    warehouseCanvas: {
      loadingError: 'Layout-Bild konnte nicht geladen werden',
      tooltip: {
        activity: 'Aktivität: {{activity}}',
        employee: 'Mitarbeiter: {{id}}',
        region: 'Region: {{name}}'
      }
  },
  charts: {
    activityDistribution: {
      title: 'Aktivitätsverteilung',
      hoursLabel: 'Stunden',
      hours: 'St'
    },
    heatmap: {
      activityIntensity: 'Aktivitätsintensität',
    }
  }
  }
} as const;

export type FlattenKeys<T extends object, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? FlattenKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type TranslationPath = FlattenKeys<typeof translations.en>;
export type Language = keyof typeof translations;

// For type checking specific sections
export type FileUploaderKeys = FlattenKeys<typeof translations.en.fileUploader>;
export type DashboardKeys = FlattenKeys<typeof translations.en.dashboard>;
export type CommonKeys = FlattenKeys<typeof translations.en.common>;
export type SettingsKeys = FlattenKeys<typeof translations.en.settings>;