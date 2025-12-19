const express = require('express'); // Framework web de Node.js
const router = express.Router(); // Crea router de Express
const employeesController = require('../../controllers/employeesController'); // Controlador de empleados
const ROLES_LIST = require('../../config/roles_list'); // Lista de roles disponibles
const verifyRoles = require('../../middleware/verifyRoles'); // Middleware de verificación de roles
const { verifyManagementAccess } = require('../../middleware/verifyOwnership');

// Rutas CRUD para endpoint base /employees - Solo admins
router.route('/')
    .get(verifyManagementAccess, employeesController.getAllEmployees) // GET - Solo admins
    .post(verifyRoles(ROLES_LIST.Admin), employeesController.createNewEmployee) // POST - Crea empleado
    .put(verifyRoles(ROLES_LIST.Admin), employeesController.updateEmployee) // PUT - Actualiza empleado
    .delete(verifyRoles(ROLES_LIST.Admin), employeesController.deleteEmployee); // DELETE - Solo Admin

// Ruta para empleado específico por ID - Los empleados pueden ver sus propios datos
router.route('/:id')
    .get(employeesController.getEmployee); // GET - Obtiene empleado por ID

// Ruta para que empleados vean su propia información
router.route('/me/profile')
    .get(employeesController.getMyProfile); // GET - Obtiene perfil del empleado logueado

// Exporta router con prefijo /employees
module.exports = router;