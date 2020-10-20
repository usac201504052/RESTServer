// 
const express = require('express')
const app = express() // Inicializar express

const bcrypt = require('bcrypt'); // Paquete para encriptar

const jwt = require('jsonwebtoken'); // Paquete para generar tokens.

const Usuario = require('../models/usuario');

app.post('/login', (req, res) => {

    let body = req.body;

    // Tomar el correo y verificar si existe
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        // Si hay error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no existe el usuario
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos!' // Indicar que el usuario como tal fallo, no es una buena practica
                }
            });
        }

        // Si existe el usuario pero la contraseña es incorrecta
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos!' // Indicar que la contra como tal fallo, no es una buena practica
                }
            });
        }

        // Firma
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        // Si todo esta bien
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
})

// Exportar para que se pueda utilizar en otro script
module.exports = app;