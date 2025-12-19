// Lista blanca de orígenes permitidos para CORS
const allowedOrigins = [
    'http://localhost:3500',    // Desarrollo local backend
    'http://localhost:5173',    // Vite dev server (puerto por defecto)
    'http://localhost:3000',    // React dev server alternativo
    'http://localhost:4173',    // Vite preview server
    // AWS Elastic Beanstalk - patrón flexible para cualquier region/env
    /https?:\/\/.*\.elasticbeanstalk\.com$/,
    process.env.AWS_EB_URL      // Variable de entorno específica
];

module.exports = allowedOrigins;