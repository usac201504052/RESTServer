const express = require('express')
const app = express() // Inicializar express

const bcrypt = require('bcrypt'); // Paquete para encriptar
const _ = require('underscore'); // Libreria que expande los alcances de JS

// Objeto usuario
const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

// Importar middleware
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

// GET - Obtener registros
app.get('/usuario', verificaToken, (req, res) => {

    // Los parametros opcionales caen en 'query'.
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    // Buscar registros con campos especificos
    // ({campos: conLosQueSeCumple}, 'exclusiones de propiedades')
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

            // Contar registros que cumplan con las especificaciones detalladas
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
app.post('/usuario', [verificaToken, verificaAdminRol], function(req, res) {

    // 'body' - va a aparecer cuando el bodyparser procese cualquier payload que reciban las peticiones.
    let body = req.body;

    // Crear una instancia del esquema
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Encriptar contraseña
        role: body.role
    });

    // Grabar el objeto en la base de datos
    usuario.save((err, usuarioDB) => {
        // Si existe un error:
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;
        // Si no hay error:
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

// PUT - para actualizar registros o datos
// Necesita recibir el id del usuario que se desea actualizar
app.put('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {

    let idN = req.params.id;

    // Filtrar solo los campos que se pueden actualizar
    // pick realiza una copia del objeto filtrando solo los campos que se desean
    // (objetoConTodasPropiedades, ['propiedades', 'que', 'se', 'desean'])
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // (id, objetoAActualizar, Opciones, Callback)
    // {new} devuelve el objeto nuevo. {runValidators} ejecuta todas las validaciones especificadas en el esquema.
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
app.delete('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {
    // Obtener id del elemento a borrar
    let id = req.params.id;

    // Eliminacion fisica: que el elemento deje de existir
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

// Exportar para que se pueda utilizar en otro script
module.exports = app;