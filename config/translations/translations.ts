export const translations = {
  en: {
    dashboard: {
      title: 'Activity Dashboard',
      totalTime: 'Total Time',
      avgActiveDuration: 'Avg Active Duration',
      totalEmployees: 'Total Users',
      busiestRegion: 'Most Active Area',
      activityDistribution: 'Activity Distribution',
      employeeActivity: 'User Activity',
      peakActivityTimes: 'Peak Activity Times',
      regionHeatmap: 'Area Heat Map',
      activityTimeline: 'Activity Timeline',
      compare: 'Compare',
      selectDates: 'Select dates',
      selectEmployee: 'Select user',
      allEmployees: 'All users',
      loadingDashboard: 'Loading dashboard...',
      preparingAnalytics: 'Preparing analytics...',
      hoursAbbreviation: 'h',
      vsText: 'vs',
      tooltips: {
        totalTime: 'Total hours across all activities and users',
        avgDuration: 'Average duration of activity per user session',
        totalEmployees: 'Total number of unique users',
        busiestRegion: 'Area with the most activity hours'
      }
    },
    settings: {
      title: 'Dashboard Settings',
      tabs: {
        activities: 'Activities', 
        dates: 'Dates', 
        charts: 'Charts',
        colors: 'Colors'
      },
      activities: {
        visibleActivities: 'Visible Activities'
      },
      dates: {
        dateSelection: 'Date Selection',
        compareMode: 'Compare Mode',
        compareModeHelp: 'Select dates to compare using the second switch for each date. Charts will display data from both selected and comparison dates'
      },
      charts: {
        visibleCharts: 'Visible Charts',
        customizeHelp: 'Toggle charts to customize your dashboard view'
      },
      colors: {
        presetThemes: 'Preset Themes',
        customThemes: 'Custom Themes',
        createNew: 'Create New',
        errors: {
          presetNameModified: 'Please provide a new name when saving modified preset theme',
          nameConflict: 'Cannot use a preset theme name. Please choose a different name.'
        },
        buttons: {
          editTheme: 'Edit theme',
          deleteTheme: 'Delete theme'
        }
      },
      colorGenerator: {
        baseHue: 'Base Hue',
        saturation: 'Saturation',
        lightness: 'Lightness',
        generateGradient: 'Generate Gradient',
        useGradientGenerator: 'Use Gradient Generator',
        primaryColors: 'Primary Colors',
        comparisonColors: 'Comparison Colors',
        themeName: 'Theme name',
        actions: {
          save: 'Save',
          update: 'Update',
          cancel: 'Cancel'
        },
        colorLabels: {
          primary: 'Primary Color {{number}}',
          comparison: 'Comparison Color {{number}}'
        }
      },
      dateSelection: {
        title: 'Date Selection',
        missingEmployees: 'Missing data from: {{employees}}',
        missingCount: 'Missing {{count}} users',
        expected: 'Expected: {{count}}',
        present: 'Present: {{count}}',
        weekLabel: 'Week of {{date}}',
        tooltip: {
          employees: 'Users: {{current}}/{{expected}}',
          totalHours: 'Total Hours: {{hours}}h',
          missingData: 'Missing data for {{count}} user(s)'
        },
        select: {
          placeholder: 'Select dates...',
          selected: 'Selected'
        },
        compareHint: 'Select two dates to compare their activities'
      }
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
        vs: 'vs'
      },
      chart: {
        noLabel: 'No label'
      }
    },
    fileUploader: {
      title: 'Upload Activity Data',
      clearFiles: 'Clear Files',
      dropHere: 'Drop the files here...',
      dragAndDrop: 'Drag and drop files here, or click to select',
      layoutImage: 'Layout Image (PNG)',
      processMetadata: 'Process Metadata (JSON)',
      warehouseActivity: 'Activity Data (JSON)',
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
      employee: 'User {{id}}',
      noActivities: 'No activities at this time'
    },
    heatmap: {
      title: 'Activity Heat Maps',
      showInstances: 'Show Instances',
      useCombinedRegions: 'Use Combined Areas',
      manageRegions: 'Manage Areas',
      colorIntensityInfo: 'Color intensity indicates relative {{type}} of activities in each area.',
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
      selected: 'Selected Period'
    },
    canvas: {
      loadingError: 'Failed to load layout image',
      tooltip: {
        activity: 'Activity: {{activity}}',
        employee: 'User: {{id}}',
        region: 'Area: {{name}}'
      }
    },
    charts: {
      activityDistribution: {
        title: 'Activity Distribution',
        hoursLabel: 'Hours',
        hours: 'h'
      },
      heatmap: {
        activityIntensity: 'Activity Intensity'
      }
    },
    regionManagement: {
      title: 'Area Management',
      tabs: {
        regions: 'Active Areas',
        combinations: 'Saved Combinations',
        excluded: 'Excluded Areas'
      },
      combine: {
        namePlaceholder: 'Name for combined area',
        buttonCombine: 'Combine',
        buttonUpdate: 'Update',
        count: '({{count}})'
      },
      regions: {
        notAvailable: 'No areas available',
        alreadyCombined: 'Already part of combination'
      },
      combinations: {
        notFound: 'No combinations found',
        deleteConfirm: 'Are you sure you want to delete this combination?',
        deleteWarning: 'This will separate the combined areas and cannot be undone.'
      },
      excluded: {
        title: 'Excluded Areas',
        tooltip: 'Click to toggle area visibility'
      }
    }
  },
  de: {
    dashboard: {
      title: 'Aktivitäts-Dashboard',
      totalTime: 'Gesamtzeit',
      avgActiveDuration: 'Durchschn. aktive Dauer',
      totalEmployees: 'Gesamtanzahl Benutzer',
      busiestRegion: 'Aktivster Bereich',
      activityDistribution: 'Aktivitätsverteilung',
      employeeActivity: 'Benutzeraktivität',
      peakActivityTimes: 'Hauptaktivitätszeiten',
      regionHeatmap: 'Bereichs-Heatmap',
      activityTimeline: 'Aktivitätszeitstrahl',
      compare: 'Vergleichen',
      selectDates: 'Daten auswählen',
      selectEmployee: 'Benutzer auswählen',
      allEmployees: 'Alle Benutzer',
      loadingDashboard: 'Dashboard wird geladen...',
      preparingAnalytics: 'Analysen werden vorbereitet...',
      hoursAbbreviation: 'Std',
      vsText: 'vs',
      tooltips: {
        totalTime: 'Gesamtstunden über alle Aktivitäten und Benutzer',
        avgDuration: 'Durchschnittliche Dauer der Aktivität pro Benutzersitzung',
        totalEmployees: 'Gesamtanzahl der einzelnen Benutzer',
        busiestRegion: 'Bereich mit den meisten Aktivitätsstunden'
      }
    },
    settings: {
      title: 'Dashboard-Einstellungen',
      tabs: {
        activities: 'Aktivitäten',
        dates: 'Daten',
        charts: 'Diagramme',
        colors: 'Farben'
      },
      activities: {
        visibleActivities: 'Sichtbare Aktivitäten'
      },
      dates: {
        dateSelection: 'Datumsauswahl',
        compareMode: 'Vergleichmodus',
        compareModeHelp: 'Wählen Sie Daten zum Vergleichen mit dem zweiten Schalter für jedes Datum. Diagramme zeigen Daten von beiden ausgewählten und Vergleichsdaten an.'
      },
      charts: {
        visibleCharts: 'Sichtbare Diagramme',
        customizeHelp: 'Schalten Sie Diagramme um, um Ihre Dashboard-Ansicht anzupassen'
      },
      colors: {
        presetThemes: 'Voreingestellte Themen',
        customThemes: 'Benutzerdefinierte Themen',
        createNew: 'Neu erstellen',
        errors: {
          presetNameModified: 'Bitte geben Sie einen neuen Namen an, wenn Sie ein voreingestelltes Thema ändern',
          nameConflict: 'Der Name eines voreingestellten Themas kann nicht verwendet werden. Bitte wählen Sie einen anderen Namen.'
        },
        buttons: {
          editTheme: 'Theme bearbeiten',
          deleteTheme: 'Theme löschen'
        }
      },
      colorGenerator: {
        baseHue: 'Basis-Farbton',
        saturation: 'Sättigung',
        lightness: 'Helligkeit',
        generateGradient: 'Farbverlauf generieren',
        useGradientGenerator: 'Farbverlaufgenerator verwenden',
        primaryColors: 'Primärfarben',
        comparisonColors: 'Vergleichsfarben',
        themeName: 'Theme-Name',
        actions: {
          save: 'Speichern',
          update: 'Aktualisieren',
          cancel: 'Abbrechen'
        },
        colorLabels: {
          primary: 'Primärfarbe {{number}}',
          comparison: 'Vergleichsfarbe {{number}}'
        }
      },
      dateSelection: {
        title: 'Datumsauswahl',
        missingEmployees: 'Fehlende Daten von: {{employees}}',
        missingCount: '{{count}} Benutzer fehlen',
        expected: 'Erwartet: {{count}}',
        present: 'Anwesend: {{count}}',
        weekLabel: 'Woche vom {{date}}',
        tooltip: {
          employees: 'Benutzer: {{current}}/{{expected}}',
          totalHours: 'Gesamtstunden: {{hours}}h',
          missingData: 'Fehlende Daten für {{count}} Benutzer'
        },
        select: {
          placeholder: 'Daten auswählen...',
          selected: 'Ausgewählt'
        },
        compareHint: 'Wählen Sie zwei Daten aus, um ihre Aktivitäten zu vergleichen'
      }
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
        vs: 'vs'
      },
      chart: {
        noLabel: 'Kein Label'
      }
    },
    fileUploader: {
      title: 'Aktivitätsdaten hochladen',
      clearFiles: 'Dateien löschen',
      dropHere: 'Dateien hier ablegen...',
      dragAndDrop: 'Dateien hier ablegen oder klicken zum Auswählen',
      layoutImage: 'Layout-Bild (PNG)',
      processMetadata: 'Prozess-Metadaten (JSON)',
      warehouseActivity: 'Aktivitätsdaten (JSON)',
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
      employee: 'Benutzer {{id}}',
      noActivities: 'Keine Aktivitäten zu diesem Zeitpunkt'
    },
    regionManagement: {
      title: 'Bereichsverwaltung',
      tabs: {
        regions: 'Aktive Bereiche',
        combinations: 'Gespeicherte Kombinationen',
        excluded: 'Ausgeschlossene Bereiche'
      },
      combine: {
        namePlaceholder: 'Name für kombinierten Bereich',
        buttonCombine: 'Kombinieren',
        buttonUpdate: 'Aktualisieren',
        count: '({{count}})'
      },
      regions: {
        notAvailable: 'Keine Bereiche verfügbar',
        alreadyCombined: 'Bereits Teil einer Kombination'
      },
      combinations: {
        notFound: 'Keine Kombinationen gefunden',
        deleteConfirm: 'Möchten Sie diese Kombination wirklich löschen?',
        deleteWarning: 'Dies trennt die kombinierten Regionen und kann nicht rückgängig gemacht werden.'
      },
      excluded: {
        title: 'Ausgeschlossene Regionen',
        tooltip: 'Klicken Sie, um die Regionssichtbarkeit umzuschalten'
      }
    },
    heatmap: {
      title: 'Aktivitäts-Heatmaps',
      showInstances: 'Instanzen anzeigen',
      useCombinedRegions: 'Kombinierte Regionen verwenden',
      manageRegions: 'Regionen verwalten',
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