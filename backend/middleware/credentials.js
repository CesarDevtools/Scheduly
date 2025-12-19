const allowedOrigins = require('../config/allowedOrigins'); // Lista de orígenes permitidos

// Middleware que maneja credenciales CORS para orígenes específicos
const credentials = (req, res, next) => {
    const origin = req.headers.origin; // Obtiene origen de la petición
    if (allowedOrigins.includes(origin)) { // Verifica si el origen está permitido
        res.header('Access-Control-Allow-Credentials', true); // Permite envío de credenciales
    }
    next(); // Permite continuar
}

module.exports = credentials 