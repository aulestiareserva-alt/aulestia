/**
 * Gestió de la interfície d'usuari
 */

const UI = {
    /**
     * Mostrar secció
     */
    mostrarSeccio(seccioId, elementClicat) {
        // Amagar totes les seccions
        $('.section').removeClass('active');
        
        // Mostrar la secció seleccionada
        $(`#${seccioId}`).addClass('active');
        
        // Actualitzar pestanyes actives
        $('.nav-tab').removeClass('active');
        
        if (elementClicat) {
            $(elementClicat).addClass('active');
        }
        
        // Si és la secció de reserves, inicialitzar els calendaris
        if (seccioId === 'reserves') {
            setTimeout(() => {
                Calendar.inicialitzar();
            }, 100);
        }
    },

    /**
     * Mostrar missatge
     */
    mostrarMissatge(selector, text, tipus) {
        $(selector)
            .html(text)
            .removeClass('exit error')
            .addClass(`missatge ${tipus}`)
            .show();
    },

    /**
     * Amagar missatge
     */
    amagarMissatge(selector) {
        $(selector).hide().html('');
    },

    /**
     * Mostrar botó continuar
     */
    mostrarBotoContinuar() {
        $('#boto-continuar-container').show();
    },

    /**
     * Amagar botó continuar
     */
    amagarBotoContinuar() {
        $('#boto-continuar-container').hide();
    },

    /**
     * Mostrar formulari de reserva
     */
    mostrarFormulariReserva(dataInici, dataFi) {
        const partsInici = dataInici.split('/');
        const partsFi = dataFi.split('/');
        const dataIniciObj = new Date(partsInici[2], partsInici[1] - 1, partsInici[0]);
        const dataFiObj = new Date(partsFi[2], partsFi[1] - 1, partsFi[0]);
        
        const nits = Utils.calcularNits(dataIniciObj, dataFiObj);
        const preuTotal = nits * APP_STATE.preuPerNit;
        
        // Actualitzar resum
        $('#resum-immoble').text(APP_STATE.immobleSeleccionat);
        $('#resum-data-inici').text(Utils.formatData(dataIniciObj));
        $('#resum-data-fi').text(Utils.formatData(dataFiObj));
        $('#resum-nits').text(nits);
        $('#resum-total').text(preuTotal.toFixed(2) + ' €');
        
        // Mostrar formulari
        $('#resum-reserva').show();
    },

    /**
     * Amagar formulari de reserva
     */
    amagarFormulariReserva() {
        $('#resum-reserva').hide();
    },

    /**
     * Mostrar modal de confirmació
     */
    mostrarModal() {
        const $modal = $('#modal-reserva');
        $modal.show();
        
        // Tancar modal en fer clic fora
        $modal.off('click').on('click', function(e) {
            if (e.target === this) {
                UI.tancarModal();
            }
        });
        
        // Prevenir tancament en clic dins del contingut
        $('.modal-content').off('click').on('click', function(e) {
            e.stopPropagation();
        });
    },

    /**
     * Tancar modal
     */
    tancarModal() {
        $('#modal-reserva').hide();
    },

    /**
     * Scroll suau a element
     */
    scrollTo(selector) {
        $(selector)[0].scrollIntoView({ 
            behavior: 'smooth' 
        });
    },

    /**
     * Mostrar indicador de càrrega en calendaris
     */
    mostrarCarregantCalendaris() {
        const html = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                <div>Carregant disponibilitat...</div>
            </div>
        `;
        
        $('#calendari-inici-permanent, #calendari-fi-permanent').html(html);
    },

    /**
     * Actualitzar preu per nit
     */
    actualitzarPreuPerNit(preu) {
        $('#resum-preu-nit').text(preu + ' €');
    }
};
