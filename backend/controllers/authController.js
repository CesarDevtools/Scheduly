const Employee = require('../model/User'); // Modelo de empleado de MongoDB
const jwt = require('jsonwebtoken'); // Para generar tokens JWT

// Controlador que maneja el proceso de login/autenticación
const handleLogin = async (req, res) => {
    const { email, password } = req.body; // Extrae email y password del body
    
    if (!email || !password) return res.status(400).json({ 'message': 'Email and password are required.' }); // Valida campos requeridos

    // Buscar empleado por email
    const foundUser = await Employee.findOne({ email: email }).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'Invalid credentials' }); // Empleado no encontrado
    
    // Comparar contraseña directamente (sin encriptación)
    const match = password === foundUser.password;
    if (match) {
        const roles = Object.values(foundUser.roles); // Extrae roles del empleado

        const accessToken = jwt.sign( // Genera token de acceso
            { 
                "UserInfo": {
                    "id": foundUser._id,
                    "identifier": foundUser.email,
                    "name": foundUser.name,
                    "type": "employee",
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET, // Usa clave secreta del .env
            { expiresIn: '4h' } // Token expira en 4 horas
        );
        const refreshToken = jwt.sign( // Genera token de renovación
            { 
                "id": foundUser._id,
                "identifier": foundUser.email,
                "type": "employee"
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' } // Refresh token expira en 7 días
        );
        
        foundUser.refreshToken = refreshToken; // Guarda refresh token en empleado
        const result = await foundUser.save(); // Actualiza empleado en MongoDB
        console.log(`Employee logged in:`, foundUser.email); // Log del resultado

        res.cookie('jwt', refreshToken, { // Envía refresh token como cookie httpOnly
            httpOnly: true,
            sameSite: 'None',
            secure: true, // Requerido para sameSite: 'None'
            maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expira en 7 días
        });

        // Envía información adicional del empleado
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

        res.status(200).json(userInfo); // Envía access token y info del usuario
    } else {
        res.status(401).json({ 'message': 'Invalid credentials' }); // Contraseña incorrecta
    }
}

module.exports = { handleLogin };