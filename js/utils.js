/**
 * Utilitats generals
 */

const Utils = {
    /**
     * Formatar data per mostrar (DD/MM/YYYY)
     */
    formatDataInput(data) {
        const any = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${dia}/${mes}/${any}`;
    },

    /**
     * Formatar data completa (text llegible)
     */
    formatData(data) {
        return data.toLocaleDateString('ca-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Normalitzar data a mitjanit
     */
    normalitzarData(data) {
        return new Date(data.getFullYear(), data.getMonth(), data.getDate());
    },

    /**
     * Crear data des de string ISO (YYYY-MM-DD)
     */
    crearDataDesdeISO(dataString) {
        const [any, mes, dia] = dataString.split('-');
        return new Date(any, mes - 1, dia, 12, 0, 0);
    },

    /**
     * Convertir data a string ISO (YYYY-MM-DD)
     */
    dataAISO(data) {
        return data.toISOString().split('T')[0];
    },

    /**
     * Comprovar si una data està ocupada
     */
    estaOcupat(data) {
        const dataNormalitzada = this.normalitzarData(data);
        const dataString = dataNormalitzada.toISOString().split('T')[0];
        return APP_STATE.datesOcupades.includes(dataString);
    },

    /**
     * Validar email
     */
    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validar telèfon
     */
    validarTelefon(telefon) {
        const re = /^[0-9+\s()-]{9,}$/;
        return re.test(telefon);
    },

    /**
     * Generar dates ocupades per defecte (mode offline)
     */
    generarDatesOcupadesPerDefecte() {
        const avui = new Date();
        const datesOcupades = [];
        
        for (let i = 0; i < 10; i++) {
            const data = new Date(avui);
            data.setDate(avui.getDate() + Math.floor(Math.random() * 30) + 5);
            datesOcupades.push(data.toISOString().split('T')[0]);
        }
        
        return datesOcupades;
    },

    /**
     * Calcular nombre de nits entre dues dates
     */
    calcularNits(dataInici, dataFi) {
        return Math.ceil((dataFi - dataInici) / (1000 * 60 * 60 * 24));
    }
};
