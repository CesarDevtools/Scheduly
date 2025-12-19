const { format } = require('date-fns'); // Para formatear fechas
const { v4: uuid } = require('uuid'); // Para generar IDs únicos

const fs = require('fs'); // Sistema de archivos síncrono
const fsPromises = require('fs/promises'); // Sistema de archivos asíncrono
const path = require('path'); // Para manejo de rutas

// Función que registra eventos en archivos de log
const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`; // Formatea fecha actual
    const logItem = `${dateTime}\t${uuid()}\t${message}`; // Crea línea de log
    console.log(logItem); // Muestra en consola
    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) { // Verifica si existe directorio logs
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs')); // Crea directorio logs
        }

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem + '\n'); // Escribe en archivo

        } catch (err) {
            console.log(err); // Maneja errores
    }
}

// Middleware que registra todas las peticiones HTTP
const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqlog.txt'); // Registra petición
    console.log(`${req.method} ${req.path}`); // Muestra en consola
    next(); // Permite continuar
}

// Exporta funciones de logging
module.exports = { logEvents, logger };