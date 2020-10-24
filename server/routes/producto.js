const express = require('express');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion')

const Producto = require('../models/producto');


// ==================
// Obtener todos los productos
// ==================
app.get('/producto', verificaToken, (req, res) => {
    // populate: usuario categoria, paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });
})

// ==================
// Obtener un producto por Id
// ==================
app.get('/producto/:id', verificaToken, (req, res) => {
    // populate: usuario categoria
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Si no se encontro el producto
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID incorrecto.'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        });
})

// ==================
// Buscar un nuevo producto
// ==================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })
})


// ==================
// Crear un nuevo producto
// ==================
app.post('/producto', verificaToken, (req, res) => {
    // Grabar usuario y categoria

    // Obtener lo que se quiere postear
    let body = req.body;
    // Nuevo objeto
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: Number(body.precioUni),
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no se creo el producto en la DB
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si se crea el producto
        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    })
})

// ==================
// Actualizar un producto
// ==================
app.put('/producto/:id', verificaToken, (req, res) => {
    // Actualizar los parametros del producto
    let id = req.params.id;
    let body = req.body;

    // Nuevas caracteristicas del producto
    let productoNew = {
        nombre: body.nombre,
        precioUni: Number(body.precioUni),
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    }
    Producto.findByIdAndUpdate(id, productoNew, { new: true, runValidators: true }, (err, productoDB) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no se encontro el producto en la DB
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        // Si se actualiza el producto
        res.json({
            ok: true,
            producto: productoDB
        });
    })
})

// ==================
// Borrar un producto
// ==================
app.delete('/producto/:id', verificaToken, (req, res) => {
    // Cambiar 'disponible' a falso. Pero que siga existiendo.
    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true }, (err, productoDB) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no se encontro el producto en la DB
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si si existe el producto
        productoDB.disponible = false;
        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            });
        })

    })
})

module.exports = app;