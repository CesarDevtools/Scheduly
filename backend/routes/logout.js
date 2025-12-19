const express = require('express'); // Framework web de Node.js
const router = express.Router(); // Crea router de Express
const logoutController = require('../controllers/logoutcontroller'); // Controlador de logout

// Ruta GET /logout - Maneja el cierre de sesión
router.get('/', logoutController.handleLogout); // Limpia tokens y cookies

module.exports = router; 