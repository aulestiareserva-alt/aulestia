/**
 * Gestió dels calendaris
 */

const Calendar = {
    /**
     * Inicialitzar calendaris
     */
    async inicialitzar() {
        
        // Carregar dates ocupades ABANS de generar els calendaris
        await this.carregarDatesOcupades();
        
        // Generar calendaris amb les dates ja carregades
        this.generarCalendariInici();
        this.generarCalendariFi();
        
    },

    /**
     * Carregar dates ocupades
     */
    async carregarDatesOcupades() {
        
        UI.mostrarCarregantCalendaris();
        
        try {
            const resultat = await API.ferPeticio('obtenirDatesOcupades', {
                immoble: APP_STATE.immobleSeleccionat
            });
            
            let datesArray = [];
            
            if (Array.isArray(resultat)) {
                datesArray = resultat;
            } else if (resultat && Array.isArray(resultat.dates)) {
                datesArray = resultat.dates;
            }
            
            APP_STATE.datesOcupades = datesArray;
            
            // Actualitzar tots els calendaris
            this.generarCalendariInici();
            this.generarCalendariFi();
            
        } catch (error) {
            APP_STATE.datesOcupades = Utils.generarDatesOcupadesPerDefecte();
            this.generarCalendariInici();
            this.generarCalendariFi();
        }
    },

    /**
     * Generar calendari d'inici
     */
    generarCalendariInici() {
        const $calendari = $('#calendari-inici-permanent');
        if (!$calendari.length) return;
        
        this._generarCalendari(
            $calendari,
            APP_STATE.mesCalendariInici,
            APP_STATE.anyCalendariInici,
            'inici-permanent'
        );
    },

    /**
     * Generar calendari de fi
     */
    generarCalendariFi() {
        const $calendari = $('#calendari-fi-permanent');
        if (!$calendari.length) return;
        
        this._generarCalendari(
            $calendari,
            APP_STATE.mesCalendariFi,
            APP_STATE.anyCalendariFi,
            'fi-permanent'
        );
    },

    /**
     * Generar calendari compacte
     */
    _generarCalendari($calendari, mes, any, tipus) {
        const avui = new Date();
        avui.setHours(12, 0, 0, 0);
        
        const dataMinima = tipus === 'fi-permanent' && APP_STATE.dataIniciSeleccionada ? 
            new Date(APP_STATE.dataIniciSeleccionada.getTime() + 24 * 60 * 60 * 1000) : avui;
        
        let html = `
            <div class="calendari-header">
                <button class="btn-nav" data-direccio="-1" data-tipus="${tipus}">←</button>
                <div class="calendari-mes">${CONFIG.MONTH_NAMES[mes]} ${any}</div>
                <button class="btn-nav" data-direccio="1" data-tipus="${tipus}">→</button>
            </div>
            <div class="dies-setmana">
                ${CONFIG.WEEKDAY_NAMES.map(dia => `<div class="dia-setmana">${dia}</div>`).join('')}
            </div>
            <div class="dies-mes">
        `;
        
        // Obtenir primer i últim dia del mes
        const primerDia = new Date(any, mes, 1);
        const ultimDia = new Date(any, mes + 1, 0);
        
        // Començar per Dilluns
        let diaIniciSetmana = primerDia.getDay();
        diaIniciSetmana = diaIniciSetmana === 0 ? 6 : diaIniciSetmana - 1;
        
        // Afegir dies buits abans del primer dia
        for (let i = 0; i < diaIniciSetmana; i++) {
            html += '<div class="dia buit"></div>';
        }
        
        // Afegir dies del mes
        for (let dia = 1; dia <= ultimDia.getDate(); dia++) {
            const dataActual = new Date(any, mes, dia, 12, 0, 0);
            let classe = 'dia';
            let disabled = false;
            
            // Verificar si és avui
            const avuiNormalitzat = Utils.normalitzarData(avui);
            if (dataActual.toDateString() === avuiNormalitzat.toDateString()) {
                classe += ' avui';
            }
            
            // Verificar si és passat
            const dataActualNomesData = Utils.normalitzarData(dataActual);
            const avuiNomesData = Utils.normalitzarData(avui);
            
            if (dataActualNomesData < avuiNomesData) {
                classe += ' passat';
                disabled = true;
            }
            
            // Per data de sortida, verificar que sigui posterior a la data d'entrada
            if (tipus === 'fi-permanent' && APP_STATE.dataIniciSeleccionada) {
                const dataIniciNomesData = Utils.normalitzarData(APP_STATE.dataIniciSeleccionada);
                const dataActualNomesData = Utils.normalitzarData(dataActual);
                
                if (dataActualNomesData <= dataIniciNomesData) {
                    classe += ' passat';
                    disabled = true;
                }
            }
            
            // Verificar si està ocupat
            if (Utils.estaOcupat(dataActual)) {
                classe += ' ocupat';
                disabled = true;
            }
            
            // Verificar si està seleccionat
            if (tipus === 'inici-permanent' && APP_STATE.dataIniciSeleccionada) {
                const dataIniciNomesData = Utils.normalitzarData(APP_STATE.dataIniciSeleccionada);
                const dataActualNomesData = Utils.normalitzarData(dataActual);
                
                if (dataActualNomesData.getTime() === dataIniciNomesData.getTime()) {
                    classe += ' seleccionat';
                }
            } else if (tipus === 'fi-permanent' && APP_STATE.dataFiSeleccionada) {
                const dataFiNomesData = Utils.normalitzarData(APP_STATE.dataFiSeleccionada);
                const dataActualNomesData = Utils.normalitzarData(dataActual);
                
                if (dataActualNomesData.getTime() === dataFiNomesData.getTime()) {
                    classe += ' seleccionat';
                }
            }
            
            const dataISO = `${any}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            
            if (disabled) {
                html += `<div class="${classe}">${dia}</div>`;
            } else {
                html += `<div class="${classe}" data-data="${dataISO}" data-tipus="${tipus}">${dia}</div>`;
            }
        }
        
        html += '</div>';
        $calendari.html(html);
        
        // Afegir event listeners
        this._afegirEventListeners($calendari);
    },

    /**
     * Afegir event listeners al calendari
     */
    _afegirEventListeners($calendari) {
        // Navegació de mesos
        $calendari.find('.btn-nav').off('click').on('click', function() {
            const direccio = parseInt($(this).data('direccio'));
            const tipus = $(this).data('tipus');
            Calendar.canviarMes(direccio, tipus);
        });
        
        // Selecció de dies
        $calendari.find('.dia[data-data]').off('click').on('click', function() {
            const dataISO = $(this).data('data');
            const tipus = $(this).data('tipus');
            Calendar.seleccionarData(dataISO, tipus);
        });
    },

    /**
     * Canviar mes
     */
    canviarMes(direccio, tipus) {
        let mes, any;
        
        if (tipus === 'inici-permanent') {
            mes = APP_STATE.mesCalendariInici;
            any = APP_STATE.anyCalendariInici;
        } else {
            mes = APP_STATE.mesCalendariFi;
            any = APP_STATE.anyCalendariFi;
        }
        
        mes += direccio;
        if (mes < 0) {
            mes = 11;
            any--;
        } else if (mes > 11) {
            mes = 0;
            any++;
        }
        
        if (tipus === 'inici-permanent') {
            APP_STATE.mesCalendariInici = mes;
            APP_STATE.anyCalendariInici = any;
            this.generarCalendariInici();
        } else {
            APP_STATE.mesCalendariFi = mes;
            APP_STATE.anyCalendariFi = any;
            this.generarCalendariFi();
        }
    },

    /**
     * Seleccionar data
     */
    seleccionarData(dataString, tipus) {
        const data = Utils.crearDataDesdeISO(dataString);
        if (tipus === 'inici-permanent') {
            this._seleccionarDataInici(data);
        } else {
            this._seleccionarDataFi(data);
        }
        
        // Actualitzar ambdós calendaris
        this.generarCalendariInici();
        this.generarCalendariFi();
        
        // Si tenim ambdues dates, mostrar botó continuar
        if (APP_STATE.dataIniciSeleccionada && APP_STATE.dataFiSeleccionada) {
            APP_STATE.datesValides = true;
            UI.mostrarMissatge('#missatge-disponibilitat', '✅ Rang de dates disponible!', 'exit');
            UI.mostrarBotoContinuar();
        } else {
            UI.amagarBotoContinuar();
        }
    },

    /**
     * Seleccionar data d'inici
     */
    _seleccionarDataInici(data) {
        if (Utils.estaOcupat(data)) {
            UI.mostrarMissatge(
                '#missatge-disponibilitat',
                '❌ Aquesta data no està disponible. Si us plau, selecciona una altra data.',
                'error'
            );
            return;
        }
        
        APP_STATE.dataIniciSeleccionada = data;
        $('#data-inici').val(Utils.formatDataInput(data));
        
        // Si ja hi ha una data de sortida anterior, netejar-la
        if (APP_STATE.dataFiSeleccionada && APP_STATE.dataFiSeleccionada <= data) {
            APP_STATE.dataFiSeleccionada = null;
            $('#data-fi').val('');
            UI.amagarBotoContinuar();
        }
        
        UI.amagarFormulariReserva();
    },

    /**
     * Seleccionar data de fi
     */
    _seleccionarDataFi(data) {
        if (!APP_STATE.dataIniciSeleccionada) {
            UI.mostrarMissatge(
                '#missatge-disponibilitat',
                '⚠️ Si us plau, selecciona primer la data d\'entrada',
                'error'
            );
            return;
        }
        
        if (data <= APP_STATE.dataIniciSeleccionada) {
            UI.mostrarMissatge(
                '#missatge-disponibilitat',
                '❌ La data de sortida ha de ser posterior a la data d\'entrada',
                'error'
            );
            return;
        }
        
        // Verificar disponibilitat de tot el rang
        const dataTemp = new Date(APP_STATE.dataIniciSeleccionada);
        let totDisponible = true;
        let dataOcupada = null;
        
        while (dataTemp < data) {
            if (Utils.estaOcupat(dataTemp)) {
                totDisponible = false;
                dataOcupada = new Date(dataTemp);
                break;
            }
            dataTemp.setDate(dataTemp.getDate() + 1);
        }
        
        if (!totDisponible) {
            UI.mostrarMissatge(
                '#missatge-disponibilitat',
                `❌ El rang seleccionat no està disponible (${Utils.formatDataInput(dataOcupada)} està ocupada)`,
                'error'
            );
            return;
        }
        
        APP_STATE.dataFiSeleccionada = data;
        $('#data-fi').val(Utils.formatDataInput(data));
    }
};
