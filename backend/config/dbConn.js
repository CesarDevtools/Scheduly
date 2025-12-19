const mongoose = require('mongoose'); // ODM para MongoDB

// Función asíncrona que establece conexión con MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATA_BASE_URI, { // Conecta usando URI del .env
            useNewUrlParser: true,    // Usa nuevo parser de URLs
            useUnifiedTopology: true  // Usa nueva topología de conexión
        });
        console.log('MongoDB connected'); // Log de conexión exitosa
    } catch (error) {
        console.error('MongoDB connection error:', error); // Log de errores de conexión
    }
}

module.exports = connectDB;