const Employee = require('../model/User'); // Modelo de empleado de MongoDB
const bcrypt = require('bcrypt'); // Para encriptar contraseñas

// Controlador que obtiene todos los empleados de la base de datos
const getAllEmployees = async (req, res) => {
    const employees = await Employee.find().select('-password -refreshToken'); // Busca todos los empleados sin contraseñas
    if (!employees) return res.status(204).json({ 'message': 'No employees found' }); // No hay empleados
    res.json(employees); // Devuelve lista de empleados
}

// Controlador que crea un nuevo empleado
const createNewEmployee = async (req, res) => {
    if (!req?.body?.name || !req?.body?.email || !req?.body?.phone || !req?.body?.password) {
        return res.status(400).json({ 'message': 'Name, email, phone, and password are required.' });
    }

    try {
        // Verifica si ya existe un empleado con ese email
        const duplicate = await Employee.findOne({ email: req.body.email }).exec();
        if (duplicate) return res.status(409).json({ 'message': 'Email already exists' });

        // Encripta la contraseña
        const hashedPwd = await bcrypt.hash(req.body.password, 10);

        const result = await Employee.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            color: req.body.color || '#3b82f6',
            password: hashedPwd
        });

        // Devuelve el empleado sin la contraseña
        const { password, refreshToken, ...employeeData } = result.toObject();
        res.status(201).json(employeeData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error creating employee' });
    }
}

// Controlador que actualiza un empleado existente
const updateEmployee = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'Employee ID is required.' });
    }

    try {
        const employee = await Employee.findOne({ _id: req.body.id }).exec();

        if (!employee) {
            return res.status(404).json({ "message": `No employee matches ID ${req.body.id}` });
        }

        // Actualiza campos si se proporcionan
        if (req.body?.name) employee.name = req.body.name;
        if (req.body?.email) {
            // Verifica si el nuevo email ya existe en otro empleado
            const duplicate = await Employee.findOne({ email: req.body.email, _id: { $ne: req.body.id } }).exec();
            if (duplicate) return res.status(409).json({ 'message': 'Email already exists' });
            employee.email = req.body.email;
        }
        if (req.body?.phone) employee.phone = req.body.phone;
        if (req.body?.color) employee.color = req.body.color;
        
        // Si se proporciona nueva contraseña, encriptarla
        if (req.body?.password) {
            const hashedPwd = await bcrypt.hash(req.body.password, 10);
            employee.password = hashedPwd;
        }

        const result = await employee.save();
        
        // Devuelve el empleado sin la contraseña
        const { password, refreshToken, ...employeeData } = result.toObject();
        res.json(employeeData);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error updating employee' });
    }
}

// Controlador que elimina un empleado
const deleteEmployee = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Employee ID is required.' }); // Valida ID requerido
    
    const employee = await Employee.findOne({ _id: req.body.id }).exec() // Busca empleado por ID
   if (!employee) { // Empleado no encontrado
        return res.status(204).json({ "message": `No employee matches ID ${req.body.id}` });
    }
    const result = await employee.deleteOne({ _id: req.body.id }); // Elimina empleado de MongoDB
    res.json(result); // Devuelve resultado de eliminación
}

// Controlador que obtiene un empleado específico por ID
const getEmployee = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Employee ID is required.' });
    
    try {
        const employee = await Employee.findOne({ _id: req.params.id }).select('-password -refreshToken').exec();
        if (!employee) {
            return res.status(404).json({ "message": `No employee matches ID ${req.params.id}.` });
        }
        res.json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving employee' });
    }
}

// Obtener perfil del empleado logueado
const getMyProfile = async (req, res) => {
    try {
        if (req.user?.type !== 'employee') {
            return res.status(403).json({ 'message': 'This endpoint is only for employees' });
        }

        const employee = await Employee.findById(req.user.id)
            .select('-password -refreshToken')
            .exec();
        
        if (!employee) {
            return res.status(404).json({ 'message': 'Employee not found' });
        }
        
        res.json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving profile' });
    }
};

// Exporta funciones del controlador
module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
    getMyProfile
}