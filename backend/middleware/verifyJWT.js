const jwt = require('jsonwebtoken'); // Librería para manejo de JWT

// Middleware que verifica la validez del token JWT
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization; // Obtiene header de autorización
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401); // Verifica formato Bearer
    const token = authHeader.split(' ')[1]; // Extrae el token
    jwt.verify(
        token, 
        process.env.ACCESS_TOKEN_SECRET, // Verifica con la clave secreta
        (err, decoded) => {
            if (err) return res.sendStatus(403); // Token inválido
            req.user = decoded.UserInfo; // Guarda toda la información del usuario
            req.roles = decoded.UserInfo.roles; // Guarda roles para compatibilidad
            next(); // Permite continuar
        }
    );
}

module.exports = verifyJWT;