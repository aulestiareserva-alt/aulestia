const API = {
    /**
     * Fer una petició al script de backend amb els paràmetres indicats
     */
    async ferPeticio(accio, parametres = {}) {
        try {
            // Crear la URL base del script
            const url = new URL(CONFIG.SCRIPT_URL);

            // Afegir l'acció com a paràmetre
            url.searchParams.append('accio', accio);
            
            // Afegir la resta de paràmetres a la URL
            Object.keys(parametres).forEach(key => {
                url.searchParams.append(key, parametres[key]);
            });

            // Fer la petició al servidor
            let data = await fetch(url.toString());

            // Convertir la resposta a JSON i retornar-la
            return await data.json()
            
        } catch (error) {
            // Si hi ha un error de connexió, retornar una resposta per defecte
            return this._obtenirRespostaPerDefecte(accio, parametres);
        }
    },

    /**
     * Obtenir dades reals utilitzant un proxy CORS
     */
    async _obtenirDadesReals(accio, parametres) {
        try {
            // Crear la URL del proxy amb la petició codificada
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(
                `${CONFIG.SCRIPT_URL}?action=${accio}&immoble=${parametres.immoble || 'Loft+Barcelona'}`
            );
            
            // Fer la petició a través del proxy
            const response = await fetch(proxyUrl);
            
            // Si la resposta és correcta, retornar les dades en format JSON
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                // Llançar error si el proxy retorna error
                throw new Error(`Proxy error: ${response.status}`);
            }
            
        } catch (error) {
            // Si falla la petició, retornar dades de prova
            return this._obtenirDadesRealsPerDefecte(accio, parametres);
        }
    },

    /**
     * Generar dades simulades més realistes per proves
     */
    _obtenirDadesRealsPerDefecte(accio, parametres) {
        const avui = new Date();
        const datesOcupades = [];
        
        // Generar algunes dates ocupades realistes
        for (let i = 0; i < 8; i++) {
            const data = new Date(avui);
            data.setDate(avui.getDate() + Math.floor(Math.random() * 60) + 10);
            datesOcupades.push(data.toISOString().split('T')[0]);
        }
        
        // Respostes simulades segons l'acció
        const respostes = {
            'obtenirDatesOcupades': { dates: datesOcupades },
            'obtenirPreuImmoble': { 
                preu: parametres.immoble === 'Loft Barcelona' ? 120 : 85 
            },
            'verificarDisponibilitat': { 
                disponible: Math.random() > 0.3,
                missatge: Math.random() > 0.3 ? '✅ Disponible' : '❌ No disponible en aquestes dates'
            },
            'ferReserva': { 
                exit: true,
                missatge: '✅ Reserva realitzada correctament (mode prova)'
            }
        };
        
        // Retornar la resposta corresponent o error si l'acció no existeix
        return respostes[accio] || { error: 'Acció no reconeguda' };
    },

    /**
     * Retornar una resposta bàsica quan hi ha errors de connexió
     */
    _obtenirRespostaPerDefecte(accio, parametres) {
        const respostes = {
            'obtenirDatesOcupades': { dates: [] },
            'obtenirPreuImmoble': { 
                preu: CONFIG.DEFAULT_PRICES[parametres.immoble] || 85
            },
            'verificarDisponibilitat': { 
                disponible: true,
                missatge: '✅ Disponible' 
            },
            'ferReserva': { 
                exit: false, 
                missatge: 'Error de connexió. Torna a intentar-ho més tard.' 
            }
        };
        
        // Retornar resposta o error si l'acció no és reconeguda
        return respostes[accio] || { error: 'Acció no reconeguda' };
    }
};