const Employee = require('../model/User'); // Modelo de empleado de MongoDB

// Controlador que maneja el proceso de logout/cierre de sesión
const handleLogout = async (req, res) => {
    // NOTA: En el cliente también se debe eliminar el accessToken
    const cookies = req.cookies; // Obtiene cookies de la petición
    
    if (!cookies?.jwt) return res.sendStatus(204); // No hay refresh token, logout exitoso
    const refreshToken = cookies.jwt; // Extrae refresh token de cookies

    // Buscar solo en empleados
    const foundUser = await Employee.findOne({ refreshToken }).exec();
    
    if (!foundUser) { // Empleado no encontrado
        res.clearCookie('jwt', { 
            httpOnly: true, 
            sameSite: 'None', 
            secure: true 
        }); // Limpia cookie aunque no exista empleado
        return res.sendStatus(204); // No Content - logout exitoso
    }

    foundUser.refreshToken = ''; // Elimina refresh token del empleado
    const result = await foundUser.save(); // Guarda cambios en MongoDB
    console.log('Employee logged out:', foundUser.email); // Log del resultado
   
    res.clearCookie('jwt', { 
        httpOnly: true, 
        sameSite: 'None', 
        secure: true 
    }); // Elimina cookie del navegador
    return res.sendStatus(204); // No Content - logout exitoso
}

module.exports = { handleLogout };