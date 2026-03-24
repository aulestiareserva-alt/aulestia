/**
 * Fitxer principal - Inicialització de l'aplicació
 */

async function posar_preus() {
    const [loft, gracia] = await Promise.all([
        API.ferPeticio("obtenirPreu", { immoble: "Loft Barcelona" }),
        API.ferPeticio("obtenirPreu", { immoble: "Habitació Gràcia" })
    ]);

    $('#loft-preu').html(loft.preu);
    $('#gracia-preu').html(gracia.preu);
}

$(document).ready(async function() {
    posar_preus()

    initEventListeners();
    
    // Carregar dades inicials
    Booking.obtenirPreu();
    Calendar.inicialitzar();
});

/**
 * Inicialitzar event listeners
 */
function initEventListeners() {
    // Selector d'immobles
    $('.btn-immoble').on('click', function() {
        $('.btn-immoble').removeClass('seleccionat');
        $(this).addClass('seleccionat');
        const immoble = $(this).data('immoble');
        Booking.seleccionarImmoble(immoble);
    });
    
    // Navegació entre seccions
    $('.nav-tab').on('click', function() {
        const seccio = $(this).data('seccio');
        if (seccio) {
            UI.mostrarSeccio(seccio, this);
        }
    });
    
    // Botó continuar amb reserva
    $('#btn-continuar').on('click', function() {
        Booking.continuar();
    });
    
    // Botó fer reserva
    $('#btn-reservar').on('click', function() {
        Booking.fer();
    });
    
    // Botó tancar modal
    $('#btn-tancar-modal').on('click', function() {
        UI.tancarModal();
    });
    
    // Tancar modal amb ESC
    $(document).on('keydown', function(e) {
        
        if (e.key === 'Escape') {
            UI.tancarModal();
        }
    });
}

/**
 * Funcions globals per compatibilitat amb HTML inline events
 * (si encara tens onclick="" al HTML, aquestes funcions les mantenen actives)
 */
window.mostrarSeccio = function(seccioId, element) {
    UI.mostrarSeccio(seccioId, element);
};

window.continuarAmbReserva = function() {
    Booking.continuar();
};

window.ferReserva = function() {
    Booking.fer();
};

window.tancarModal = function() {
    UI.tancarModal();
};

window.netejarSeleccions = function() {
    Booking.netejar();
};
