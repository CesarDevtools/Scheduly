const express = require('express'); // Framework web de Node.js
const router = express.Router(); // Crea router de Express
const authController = require('../controllers/authController'); // Controlador de autenticación

// Ruta POST /auth - Maneja el proceso de login/autenticación
router.post('/', authController.handleLogin); // Procesa credenciales y genera tokens

// Exporta router con prefijo /auth
module.exports = router; 