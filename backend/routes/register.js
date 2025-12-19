const express = require('express'); // Framework web de Node.js
const router = express.Router(); // Crea router de Express
const registerController = require('../controllers/registerController'); // Controlador de registro
const ROLES_LIST = require('../config/roles_list');
const verifyRoles = require('../middleware/verifyRoles');

// Ruta POST /register - Solo admins pueden registrar nuevos usuarios/empleados
router.post('/', verifyRoles(ROLES_LIST.Admin), registerController.handleNewUser);


module.exports = router;