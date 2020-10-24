const express = require('express');
const app = express();

// Todas las peticiones tendran que utilizar la validacion de token
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            })
        })
});

// ============================
// Mostrar una categoria por ID
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si no se encontro la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID incorrecto.'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
});

// ============================
// Crear una nueva categoria
// ============================
app.post('/categoria', verificaToken, (req, res) => {
    // Regresa una nueva categoria
    // req.usuario_id

    // Obtener lo que se quiere postear
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no se creo la categoria en la DB
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si se crea la categoria
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// ============================
// Actualizar una categoria
// ============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    // Actualizar la descripcion de la categoria
    let id = req.params.id;
    let body = req.body;

    // Nuevas caracteristicas de la categoria
    let descCategoria = {
        descripcion: body.descripcion
    }
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no se encontro la categoria en la DB
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si se actualiza la categoria
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// ============================
// Borrar una categoria
// Solo un admin podra borrar
// ============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {
    // Categoria.findByIdAndRemove
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no se encontro la categoria en la DB
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        })
    });
});

module.exports = app;