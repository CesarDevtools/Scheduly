const ROLES_LIST = require('../config/roles_list');

// Middleware que verifica si el empleado puede acceder solo a sus propios datos
const verifyOwnership = (req, res, next) => {
    const userInfo = req.user;
    
    // Si es Admin, puede acceder a todos los datos
    if (userInfo?.roles?.includes(ROLES_LIST.Admin)) {
        return next();
    }

    // Si es empleado, solo puede acceder a sus propios datos
    if (userInfo?.type === 'employee') {
        // Para rutas que incluyen employeeId en parámetros
        if (req.params?.employeeId) {
            if (req.params.employeeId !== userInfo.id) {
                return res.status(403).json({ 
                    'message': 'Access denied. You can only view your own data.' 
                });
            }
        }
        
        // Para operaciones de schedules, automáticamente filtrar por el empleado actual
        req.employeeFilter = userInfo.id;
    }

    next();
};

// Middleware específico para verificar que solo admins pueden crear/editar/eliminar
const verifyManagementAccess = (req, res, next) => {
    const userInfo = req.user;
    
    if (!userInfo?.roles?.includes(ROLES_LIST.Admin)) {
        return res.status(403).json({ 
            'message': 'Access denied. Admin access required.' 
        });
    }
    
    next();
};

module.exports = { verifyOwnership, verifyManagementAccess };