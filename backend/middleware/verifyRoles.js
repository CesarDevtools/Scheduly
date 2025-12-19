// Middleware que verifica si el usuario tiene alguno de los roles permitidos
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.sendStatus(401); // No hay roles en la request
        const rolesArray = [...allowedRoles]; // Convierte roles permitidos en array
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true); // Busca coincidencia
        if (!result) return res.sendStatus(403); // Usuario no tiene rol necesario
        next(); // Permite continuar si tiene rol válido
    }
}

module.exports = verifyRoles;