// 
const express = require('express')
const app = express() // Inicializar express

const bcrypt = require('bcrypt'); // Paquete para encriptar
const jwt = require('jsonwebtoken'); // Paquete para generar tokens.

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciones de Google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    // Objeto de google retornado por la promesa
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        });

    // Verificar si no hay otro correo igual
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        // Si hay error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si existe un usuario ya creado
        if (usuarioDB) {
            // Revisar si se autentico por google, si no:
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usar autenticacion normal'
                    }
                });
            } else {
                // Si si se autentico por google, renovar token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // Si el usuario no existe en la DB, crearlo
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            // Grabar en DB
            usuario.save((err, usuarioDB) => {
                // Si hay error
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                // Generar token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            })
        }
    })

    //res.json({
    //    usuario: googleUser
    //});

})

// Exportar para que se pueda utilizar en otro script
module.exports = app;