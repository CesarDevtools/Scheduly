const allowedOrigins = require('./allowedOrigins'); // Lista de orígenes permitidos

// Configuración de CORS (Cross-Origin Resource Sharing)
const corsOptions = {
    origin: (origin, callback) => { // Función que valida orígenes
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // Permite si está en lista blanca o es petición local
            callback(null, true) // Permite la petición
        } else {
            callback(new Error('Not allowed by CORS')); // Rechaza la petición
        }
    },
    optionsSuccessStatus: 200 // Para compatibilidad con navegadores legacy
}

module.exports = corsOptions;