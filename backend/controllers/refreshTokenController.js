const Employee = require('../model/User'); // Modelo de empleado de MongoDB
const jwt = require('jsonwebtoken'); // Para verificar y generar tokens JWT

// Controlador que maneja la renovación de access tokens usando refresh tokens
const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies; // Obtiene cookies de la petición
    
    if (!cookies?.jwt) return res.sendStatus(401); // No hay refresh token en cookies

    const refreshToken = cookies.jwt; // Extrae refresh token de cookies
    
    // Buscar solo en empleados
    const foundUser = await Employee.findOne({ refreshToken }).exec();
    const userType = 'employee';
    
    if (!foundUser) return res.sendStatus(403); // Refresh token no válido

    jwt.verify( // Verifica la validez del refresh token
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET, // Usa clave secreta del .env
        (err, decoded) => {
            const identifier = foundUser.email;
            
            if (err || foundUser._id.toString() !== decoded.id || identifier !== decoded.identifier) {
                return res.sendStatus(403);
            }
            
            const roles = Object.values(foundUser.roles); // Extrae roles del empleado
            const accessToken = jwt.sign( // Genera nuevo access token
                { "UserInfo": 
                    { 
                        "id": foundUser._id,
                        "identifier": identifier,
                        "name": foundUser.name,
                        "type": "employee",
                        "roles": roles 
                    } 
                },
                process.env.ACCESS_TOKEN_SECRET, // Usa clave secreta del access token
                { expiresIn: '4h' } // Nuevo token expira en 4 horas
            );

            const userInfo = {
                accessToken,
                user: {
                    id: foundUser._id,
                    name: foundUser.name,
                    email: foundUser.email,
                    color: foundUser.color,
                    type: "employee",
                    roles: roles
                }
            };

            res.status(200).json(userInfo); // Envía nuevo access token e info
        }
    );
}

module.exports = { handleRefreshToken };