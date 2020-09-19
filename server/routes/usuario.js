const express = require('express')
const app = express()

const bcrypt = require('bcrypt');
const _ = require('underscore');

// Objeto usuario
const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

// GET - Obtener registros
app.get('/usuario', function(req, res) {

    // Los parametros opcionales caen en 'query'.
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email estado')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Contar registros
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })
        })
});

// POST - para crear registros
app.post('/usuario', function(req, res) {

    // 'body' - va a aparecer cuando el bodyparser procese cualquier payload que reciban las peticiones.
    let body = req.body;

    // Crear una instancia del esquema
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // Grabar el objeto en la base de datos
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

// PUT - para actualizar registros o datos
app.put('/usuario/:id', function(req, res) {

    let idN = req.params.id;
    // Filtrar solo los campos que se pueden actualizar
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    Usuario.findByIdAndUpdate(idN, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })
});

// DELETE - para cambiar el estado de algo pero el registro siempre queda
app.delete('/usuario/:id', function(req, res) {
    // Obtener id del elemento a borrar
    let id = req.params.id;

    // Eliminacion fisica, que el elemento deje de existir
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    // Cambiar el 'estado' del elemento a false
    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;