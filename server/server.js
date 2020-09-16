require('./config/config');

const express = require('express')
const app = express()

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/usuario', function(req, res) {
    res.json('get Usuario');
})

// POST - para crear registros
app.post('/usuario', function(req, res) {

    // 'body' - va a aparecer cuando el bodyparser procese cualquier payload que reciban las peticiones.
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nobmre es necesario'
        });
    } else {
        res.json({
            persona: body
        });
    }
})

// PUT - para actualizar registros o datos
app.put('/usuario/:id', function(req, res) {

    let idN = req.params.id;

    res.json({
        idN
    });
})

// DELETE - para cambiar el estado de algo pero el registro siempre queda
app.delete('/usuario', function(req, res) {
    res.json('delete Usuario');
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto ', process.env.PORT);
});