// Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express'); // Framework web de Node.js
const app = express(); // Crea instancia de Express
const path = require('path'); // Para manejo de rutas de archivos
const { logger } = require('./middleware/logEvents'); // Middleware de logging
const errorHandler = require('./middleware/errorHandler'); // Middleware de manejo de errores
const cors = require('cors'); // Middleware para CORS
const corsOptions = require('./config/corsOptions'); // Configuración de CORS
const verifyJWT = require('./middleware/verifyJWT'); // Middleware de verificación JWT
const cookieParser = require('cookie-parser'); // Parser de cookies
const credentials = require('./middleware/credentials'); // Middleware de credenciales CORS
const mongoose = require('mongoose'); // ODM para MongoDB
const connectDB = require('./config/dbConn'); // Función de conexión a MongoDB
const PORT = process.env.PORT || 3500; // Puerto del servidor

// Conecta a la base de datos MongoDB
connectDB();

// Middleware de logging personalizado
app.use(logger);

// Middleware para manejo de credenciales CORS
app.use(credentials);

// Middleware CORS con configuración personalizada
app.use(cors(corsOptions));

// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: false }));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear cookies
app.use(cookieParser());

// Sirve archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '/public')));

// Sirve archivos estáticos del React build
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas públicas (no requieren autenticación)
app.use('/', require('./routes/root')); // Página principal
app.use('/auth', require('./routes/auth')); // Autenticación/login
app.use('/refresh', require('./routes/refresh')); // Renovación de tokens
app.use('/logout', require('./routes/logout')); // Cierre de sesión

app.use(verifyJWT); // Middleware JWT - Rutas siguientes requieren autenticación
app.use('/register', require('./routes/register')); // Registro de usuarios (requiere admin)
app.use('/employees', require('./routes/api/employees')); // CRUD de empleados (protegido)
app.use('/schedules', require('./routes/api/schedules')); // CRUD de horarios (protegido)

// Ruta simple para obtener datos estáticos
app.get('/positions', (req, res) => {
    const positions = ['Abrir kiosko', 'Cafetera', 'Medio', 'Mercancia', 'Caja', 'Día libre'];
    res.json(positions);
});

app.use(errorHandler); // Middleware de manejo de errores (debe ir al final)

// Manejo de todas las rutas para React Router (SPA) - DEBE IR AL FINAL
app.get('*', (req, res) => {
    // Si es una ruta de API, devolver 404 JSON
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/auth') || 
        req.originalUrl.startsWith('/refresh') || req.originalUrl.startsWith('/logout') ||
        req.originalUrl.startsWith('/register') || req.originalUrl.startsWith('/employees') ||
        req.originalUrl.startsWith('/schedules') || req.originalUrl.startsWith('/positions')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Para cualquier otra ruta, servir el index.html de React
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicia el servidor solo después de conectar a MongoDB
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB'); // Log de conexión exitosa
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Inicia servidor
});