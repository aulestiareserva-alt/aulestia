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
// ============================================
// GESTIÓ ESTADES LLARGUES VS RESERVES NORMALS
// ============================================

// Funció per canviar la visualització entre reserves normals i estades llargues
function canviarVisualitzacioEstades(tipus) {
    const sistemaNormal = document.getElementById('sistema-reserves-normal');
    const formulariLlargues = document.getElementById('formulari-estades-llargues');
    
    if (tipus === 'estades-llargues') {
        // Amagar sistema normal, mostrar formulari d'estades llargues
        if (sistemaNormal) sistemaNormal.style.display = 'none';
        if (formulariLlargues) formulariLlargues.style.display = 'block';
    } else {
        // Mostrar sistema normal, amagar formulari d'estades llargues
        if (sistemaNormal) sistemaNormal.style.display = 'block';
        if (formulariLlargues) formulariLlargues.style.display = 'none';
    }
}

// Modificar l'event listener del selector d'immobles per incloure estades llargues
$(document).ready(function() {
    // Guardar la funció original si existeix (per no sobreescriure)
    const originalImmobleClick = $('.btn-immoble').off('click');
    
    // Nou event listener per als botons d'immoble
    $(document).on('click', '.btn-immoble', function() {
        $('.btn-immoble').removeClass('seleccionat');
        $(this).addClass('seleccionat');
        const immoble = $(this).data('immoble');
        
        // Comprovar si és l'opció d'estades llargues
        if (immoble === 'estades-llargues') {
            canviarVisualitzacioEstades('estades-llargues');
            
            // Configurar el camp replyto automàticament per Formspree
            setTimeout(function() {
                const emailInput = document.getElementById('email-formspree');
                const replytoHidden = document.getElementById('replyto-formspree');
                if (emailInput && replytoHidden) {
                    // Eliminar event listeners anteriors
                    const newEmailInput = emailInput.cloneNode(true);
                    emailInput.parentNode.replaceChild(newEmailInput, emailInput);
                    
                    newEmailInput.addEventListener('input', function() {
                        const replytoField = document.getElementById('replyto-formspree');
                        if (replytoField) replytoField.value = this.value;
                    });
                    
                    // Inicialitzar amb el valor actual
                    if (newEmailInput.value) {
                        replytoHidden.value = newEmailInput.value;
                    }
                }
            }, 100);
        } else {
            canviarVisualitzacioEstades('normal');
            
            // Si és un immoble real, cridar la funció original de Booking
            if (typeof Booking !== 'undefined' && Booking.seleccionarImmoble) {
                Booking.seleccionarImmoble(immoble);
            }
        }
    });
});

// Funció global per si es necessita des de HTML
window.canviarVisualitzacioEstades = canviarVisualitzacioEstades;
