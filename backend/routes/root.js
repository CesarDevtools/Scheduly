const express = require('express'); // Framework web de Node.js
const path = require('path'); // Para manejo de rutas de archivos
const router = express.Router(); // Crea router de Express

// Rutas raíz que sirven la página principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')); // Sirve React app
});

router.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')); // Sirve React app
});

module.exports = router;