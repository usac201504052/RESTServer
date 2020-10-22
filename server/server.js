require('./config/config');

const express = require('express')
const mongoose = require('mongoose');
const path = require('path'); // Para extraer la direccion correcta de los directorios

const app = express()

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Habilitar que la carpeta 'public' sea accedida desde cualquier lugar
// Implementar middleware para hacer publico todo el directorio
app.use(express.static(path.resolve(__dirname, '../public')));

// Importar el archivo que contiene las rutas. (Global)
app.use(require('./routes/index'));

// Establecer conexion con base de datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto ', process.env.PORT);
});