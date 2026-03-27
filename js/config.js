/**
 * Configuració global de l'aplicació
 */

const CONFIG = {
    // URL de Google Apps Script
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxxTY6jMf2PyTkucTYw6o83Pf31jn1mEfBg3LbATOVFq8nxjRSgqOH5ehD19yFzvXY/exec',
    
    // Configuració de preus per defecte
    DEFAULT_PRICES: {
        'Loft Barcelona': 1,
        'Apartament Costa Brava': 1
    },
    
    // Noms dels mesos en català
    MONTH_NAMES: ['Gen', 'Feb', 'Mar', 'Abr', 'Maig', 'Jun', 
                  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'],
    
    // Dies de la setmana en català
    WEEKDAY_NAMES: ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']
};

// Estat global de l'aplicació
const APP_STATE = {
    immobleSeleccionat: 'Loft Barcelona',
    preuPerNit: 0,
    datesValides: false,
    datesOcupades: [],
    dataIniciSeleccionada: null,
    dataFiSeleccionada: null,
    mesCalendariInici: new Date().getMonth(),
    anyCalendariInici: new Date().getFullYear(),
    mesCalendariFi: new Date().getMonth(),
    anyCalendariFi: new Date().getFullYear()
};
