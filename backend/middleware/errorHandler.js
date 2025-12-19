const { logEvents } = require('./logEvents'); // Importa función de logging

// Middleware que maneja todos los errores de la aplicación
const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}\t${err.message}`, 'errlog.txt'); // Registra error en archivo
    console.error(err.stack); // Muestra stack trace en consola
    res.status(500).send(err.message || 'Something broke!'); // Envía respuesta de error
};


module.exports = errorHandler;
