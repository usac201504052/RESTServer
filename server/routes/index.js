const express = require('express')
const app = express() // Inicializar express

// Para indicar todas las rutas necesarias en un solo archivo:
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));

// Exportar para que se pueda utilizar en otro script
module.exports = app;