const Schedule = require('../model/Schedule');
const Employee = require('../model/User');

// Obtener todos los horarios (filtrado automático para empleados)
const getAllSchedules = async (req, res) => {
    try {
        let query = {};
        
        // Si hay filtro de empleado (empleado logueado), aplicarlo
        if (req.employeeFilter) {
            query.employee = req.employeeFilter;
        }
        
        const schedules = await Schedule.find(query)
            .populate('employee', 'name email color')
            .sort({ date: 1, startTime: 1 });
        
        if (!schedules?.length) {
            return res.status(204).json({ 'message': 'No schedules found' });
        }
        
        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving schedules' });
    }
};

// Obtener horarios por empleado
const getSchedulesByEmployee = async (req, res) => {
    if (!req?.params?.employeeId) {
        return res.status(400).json({ 'message': 'Employee ID is required.' });
    }

    try {
        const schedules = await Schedule.find({ employee: req.params.employeeId })
            .populate('employee', 'name email color')
            .sort({ date: 1, startTime: 1 });
        
        if (!schedules?.length) {
            return res.status(204).json({ 'message': 'No schedules found for this employee' });
        }
        
        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving employee schedules' });
    }
};

// Obtener horarios por rango de fechas (filtrado automático para empleados)
const getSchedulesByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        return res.status(400).json({ 'message': 'Start date and end date are required.' });
    }

    try {
        // Normalizar fechas para incluir todo el día
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Inicio del día
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Fin del día
        
        let query = {
            date: {
                $gte: start,
                $lte: end
            }
        };
        
        // Si hay filtro de empleado (empleado logueado), aplicarlo
        if (req.employeeFilter) {
            query.employee = req.employeeFilter;
        }
        
        const schedules = await Schedule.find(query)
        .populate('employee', 'name email color')
        .sort({ date: 1, startTime: 1 });
        
        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving schedules by date range' });
    }
};

// Crear nuevo horario
const createNewSchedule = async (req, res) => {
    const { employee, date, startTime, endTime, position, nota = '' } = req.body;

    if (!employee || !date || !startTime || !endTime || !position) {
        return res.status(400).json({ 
            'message': 'Employee, date, start time, end time, and position are required.' 
        });
    }

    try {
        // Verificar que el empleado existe
        const employeeExists = await Employee.findById(employee).exec();
        if (!employeeExists) {
            return res.status(404).json({ 'message': 'Employee not found' });
        }

        // Verificar conflictos de horario para el mismo empleado
        const conflictingSchedule = await Schedule.findOne({
            employee,
            date: new Date(date),
            $or: [
                {
                    startTime: { $lte: startTime },
                    endTime: { $gt: startTime }
                },
                {
                    startTime: { $lt: endTime },
                    endTime: { $gte: endTime }
                },
                {
                    startTime: { $gte: startTime },
                    endTime: { $lte: endTime }
                }
            ]
        });

        if (conflictingSchedule) {
            return res.status(409).json({ 
                'message': 'Employee already has a conflicting schedule at this time' 
            });
        }

        const result = await Schedule.create({
            employee,
            date: new Date(date),
            startTime,
            endTime,
            position,
            nota
        });

        // Devolver el horario con información del empleado
        const newSchedule = await Schedule.findById(result._id)
            .populate('employee', 'name email color');

        res.status(201).json(newSchedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error creating schedule' });
    }
};

// Actualizar horario existente
const updateSchedule = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'Schedule ID is required.' });
    }

    try {
        const schedule = await Schedule.findOne({ _id: req.body.id }).exec();
        if (!schedule) {
            return res.status(404).json({ "message": `No schedule matches ID ${req.body.id}` });
        }

        const { employee, date, startTime, endTime, position, status, nota } = req.body;

        // Si se cambia empleado, fecha u horario, verificar conflictos
        if (employee || date || startTime || endTime) {
            const checkEmployee = employee || schedule.employee;
            const checkDate = date ? new Date(date) : schedule.date;
            const checkStartTime = startTime || schedule.startTime;
            const checkEndTime = endTime || schedule.endTime;

            const conflictingSchedule = await Schedule.findOne({
                _id: { $ne: req.body.id }, // Excluir el horario actual
                employee: checkEmployee,
                date: checkDate,
                $or: [
                    {
                        startTime: { $lte: checkStartTime },
                        endTime: { $gt: checkStartTime }
                    },
                    {
                        startTime: { $lt: checkEndTime },
                        endTime: { $gte: checkEndTime }
                    },
                    {
                        startTime: { $gte: checkStartTime },
                        endTime: { $lte: checkEndTime }
                    }
                ]
            });

            if (conflictingSchedule) {
                return res.status(409).json({ 
                    'message': 'Employee already has a conflicting schedule at this time' 
                });
            }
        }

        // Actualizar campos
        if (employee) schedule.employee = employee;
        if (date) schedule.date = new Date(date);
        if (startTime) schedule.startTime = startTime;
        if (endTime) schedule.endTime = endTime;
        if (position) schedule.position = position;
        if (status) schedule.status = status;
        if (nota !== undefined) schedule.nota = nota;

        const result = await schedule.save();
        
        // Devolver con información del empleado
        const updatedSchedule = await Schedule.findById(result._id)
            .populate('employee', 'name email color');
        
        res.json(updatedSchedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error updating schedule' });
    }
};

// Eliminar horario
const deleteSchedule = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'Schedule ID is required.' });
    }

    try {
        const schedule = await Schedule.findOne({ _id: req.body.id }).exec();
        if (!schedule) {
            return res.status(404).json({ "message": `No schedule matches ID ${req.body.id}` });
        }

        const result = await schedule.deleteOne({ _id: req.body.id });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error deleting schedule' });
    }
};

// Obtener un horario específico
const getSchedule = async (req, res) => {
    if (!req?.params?.id) {
        return res.status(400).json({ 'message': 'Schedule ID is required.' });
    }

    try {
        const schedule = await Schedule.findOne({ _id: req.params.id })
            .populate('employee', 'name email color')
            .exec();
        
        if (!schedule) {
            return res.status(404).json({ "message": `No schedule matches ID ${req.params.id}.` });
        }
        
        res.json(schedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving schedule' });
    }
};

// Obtener horarios del empleado autenticado
const getMySchedules = async (req, res) => {
    try {
        console.log('getMySchedules called by user:', req.user);
        
        if (req.user?.roles?.includes(5150)) {
            // Admin users can access this endpoint too, but should use regular /schedules
            console.log('Admin user accessing my-schedules endpoint');
        } else if (!req.user?.roles?.includes(3001)) {
            return res.status(403).json({ 'message': 'This endpoint is only for employees' });
        }
        
        console.log('Finding schedules for employee ID:', req.user.id);
        const schedules = await Schedule.find({ employee: req.user.id })
            .populate('employee', 'name email color')
            .sort({ date: 1, startTime: 1 });
        
        console.log('Found schedules:', schedules.length);
        res.json(schedules);
    } catch (err) {
        console.error('Error in getMySchedules:', err);
        res.status(500).json({ 'message': 'Error retrieving your schedules' });
    }
};

module.exports = {
    getAllSchedules,
    getSchedulesByEmployee,
    getSchedulesByDateRange,
    createNewSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedule,
    getMySchedules
};