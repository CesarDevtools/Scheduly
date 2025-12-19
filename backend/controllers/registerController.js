const Employee = require('../model/User'); // Modelo de empleado de MongoDB

// Controlador que maneja el registro de nuevos empleados
const handleNewUser = async (req, res) => {
    const { name, email, phone, password, color, isAdmin } = req.body; // Extrae datos del empleado del body
    
    if (!name || !email || !phone || !password || !color) {
        return res.status(400).json({ 
            'message': 'Name, email, phone, password, and color are required.' 
        });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 'message': 'Invalid email format.' });
    }
    
    const duplicate = await Employee.findOne({ email: email }).exec(); // Verifica si empleado ya existe
    if (duplicate) return res.status(409).json({ 'message': 'Email already exists.' });
    
    try {
        // Configurar roles del empleado
        const roles = {
            Employee: 3001 // Rol por defecto
        };
        
        // Si se especifica que es admin, agregar rol de admin
        if (isAdmin === true) {
            roles.Admin = 5150;
        }

        const result = await Employee.create({ // Crea nuevo empleado en MongoDB
            name: name,
            email: email,
            phone: phone,
            password: password,
            color: color,
            roles: roles
        });

        console.log(`New employee created: ${result.name} (${result.email})`); // Log del empleado creado
        
        // Devolver empleado sin contraseña
        const { password: pwd, refreshToken, ...employeeData } = result.toObject();
        
        res.status(201).json({ 
            'success': `New employee ${name} created successfully!`,
            'employee': employeeData
        });
    } catch (err) {
        res.status(500).json({ 'message': err.message }); // Maneja errores de creación
    }
}

module.exports = { handleNewUser };