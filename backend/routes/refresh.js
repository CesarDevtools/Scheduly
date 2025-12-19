const express = require('express'); // Framework web de Node.js
const router = express.Router(); // Crea router de Express
const refreshTokenController = require('../controllers/refreshTokenController'); // Controlador de refresh tokens

// Ruta GET /refresh - Renueva access tokens usando refresh tokens
router.get('/', refreshTokenController.handleRefreshToken); // Genera nuevo access token


module.exports = router; 