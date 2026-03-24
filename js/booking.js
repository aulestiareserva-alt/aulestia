/**
 * Gestió de reserves
 */

const Booking = {
    /**
     * Continuar amb la reserva
     */
    continuar() {
        const dataInici = $('#data-inici').val();
        const dataFi = $('#data-fi').val();
        
        if (!dataInici || !dataFi) {
            alert('Si us plau, selecciona les dates primer');
            return;
        }
        
        UI.mostrarFormulariReserva(dataInici, dataFi);
        UI.scrollTo('#formulari-reserva');
    },

    /**
     * Fer reserva
     */
    async fer() {
        const nom = $('#nom').val();
        const email = $('#email').val();
        const telefon = $('#telefon').val();
        const $btnReservar = $('#btn-reservar');
        if ($btnReservar.prop('disabled')) return;
        $btnReservar.prop('disabled', true).text('🔄 Processant...');
        // Validacions bàsiques
        if (!this._validarFormulari(nom, email, telefon)) {
            return;
        }
        
        if (!APP_STATE.datesValides) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Si us plau, verifica primer la disponibilitat de les dates',
                'error'
            );
            return;
        }

        if (!APP_STATE.dataIniciSeleccionada || !APP_STATE.dataFiSeleccionada) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Error: No s\'han seleccionat dates vàlides',
                'error'
            );
            return;
        }

        // Validar que les dates són futures
        const avui = new Date();
        avui.setHours(0, 0, 0, 0);
        
        if (APP_STATE.dataIniciSeleccionada < avui) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Error: La data d\'entrada no pot ser anterior a avui',
                'error'
            );
            return;
        }

        if (APP_STATE.dataFiSeleccionada <= APP_STATE.dataIniciSeleccionada) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Error: La data de sortida ha de ser posterior a la d\'entrada',
                'error'
            );
            return;
        }

        // Preparar dades de reserva
        const dadesReserva = this._prepararDadesReserva(nom, email, telefon);
        
        
        try {
            UI.mostrarMissatge('#missatge-reserva', '⏳ Processant la teva reserva...', 'exit');
            
            const resultat = await API.ferPeticio('ferReserva', dadesReserva);
            if (resultat && resultat.result == "success") {
                this._processarReservaExitosa(resultat);
            } else {
                const missatgeError = resultat?.missatge || 'Error desconegut en realitzar la reserva';
                UI.mostrarMissatge('#missatge-reserva', '❌ ' + missatgeError, 'error');
            }
        } catch (error) {
            UI.mostrarMissatge('#missatge-reserva', '❌ Error de connexió: ' + error.message, 'error');
        } finally {
            $btnReservar.prop('disabled', false).text('🚀 Fer Reserva');
        }
    },

    /**
     * Validar formulari
     */
    _validarFormulari(nom, email, telefon) {
        if (!nom || !email || !telefon) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Si us plau, completa tots els camps del formulari',
                'error'
            );
            return false;
        }
        
        if (!Utils.validarEmail(email)) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Si us plau, introdueix un email vàlid',
                'error'
            );
            return false;
        }
        
        if (!Utils.validarTelefon(telefon)) {
            UI.mostrarMissatge(
                '#missatge-reserva',
                'Si us plau, introdueix un telèfon vàlid',
                'error'
            );
            return false;
        }
        
        return true;
    },

    /**
     * Preparar dades de reserva
     */
    _prepararDadesReserva(nom, email, telefon) {
        const nits = Utils.calcularNits(
            APP_STATE.dataIniciSeleccionada,
            APP_STATE.dataFiSeleccionada
        );
        
        return {
            nom: nom.trim(),
            email: email.trim(),
            telefon: telefon.trim(),
            immoble: APP_STATE.immobleSeleccionat,
            data_inici: Utils.dataAISO(APP_STATE.dataIniciSeleccionada),
            data_fi: Utils.dataAISO(APP_STATE.dataFiSeleccionada),
            nits: nits,
            preu_total: nits * APP_STATE.preuPerNit
        };
    },

    /**
     * Processar reserva exitosa
     */
    _processarReservaExitosa(resultat) {
        UI.mostrarMissatge(
            '#missatge-reserva',
            resultat.missatge || '✅ Reserva realitzada amb èxit!',
            'exit'
        );
        UI.mostrarModal();
        
        // Netejar el formulari després d'uns segons
        setTimeout(() => {
            this.netejar();
            UI.amagarFormulariReserva();
            Calendar.carregarDatesOcupades();
            
            setTimeout(() => {
                UI.mostrarSeccio('inici');
            }, 1000);
        }, 3000);
    },

    /**
     * Netejar seleccions i formulari
     */
    netejar() {
        APP_STATE.datesOcupades = [];
        APP_STATE.datesValides = false;
        APP_STATE.dataIniciSeleccionada = null;
        APP_STATE.dataFiSeleccionada = null;
        
        $('#data-inici, #data-fi, #nom, #email, #telefon').val('');
        
        UI.amagarBotoContinuar();
        UI.amagarFormulariReserva();
        UI.amagarMissatge('#missatge-disponibilitat');
        UI.amagarMissatge('#missatge-reserva');
        
        Calendar.inicialitzar();
    },

    /**
     * Obtenir preu de l'immoble
     */
    async obtenirPreu() {
        try {
            const resultat = await API.ferPeticio("obtenirPreu",{"immoble":APP_STATE.immobleSeleccionat});
            if (typeof resultat === 'number') {
                APP_STATE.preuPerNit = resultat;
            } else if (resultat && typeof resultat.preu === 'number') {
                APP_STATE.preuPerNit = resultat.preu;
            } else {
                APP_STATE.preuPerNit = CONFIG.DEFAULT_PRICES[APP_STATE.immobleSeleccionat] || 85;
            }
            UI.actualitzarPreuPerNit(APP_STATE.preuPerNit);
            
        } catch (error) {
            APP_STATE.preuPerNit = CONFIG.DEFAULT_PRICES[APP_STATE.immobleSeleccionat] || 85;
            UI.actualitzarPreuPerNit(APP_STATE.preuPerNit);
        }
    },

    /**
     * Seleccionar immoble
     */
    seleccionarImmoble(immoble) {
        APP_STATE.immobleSeleccionat = immoble;
        this.netejar();
        this.obtenirPreu();
        Calendar.inicialitzar();
    }
};
