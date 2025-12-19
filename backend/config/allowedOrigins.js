// Lista blanca de orígenes permitidos para CORS
const allowedOrigins = [
    'http://localhost:3500',    // Desarrollo local backend
    'http://localhost:5173',    // Vite dev server (puerto por defecto)
    'http://localhost:3000',    // React dev server alternativo
    'http://localhost:4173',    // Vite preview server
    // Render deployment URL (será tu URL de Render)
    process.env.RENDER_EXTERNAL_URL,     // Render automáticamente pone esta variable
    'https://scheduly-hrwy.onrender.com'        // Reemplaza con tu URL real de Render
];

module.exports = allowedOrigins;