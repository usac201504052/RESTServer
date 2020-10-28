const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Importar el esquema de usuario y producto
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// Importar filesystem
const fs = require('fs');

const path = require('path'); // Para obtener dirname

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    // 'tipo' se refiere a si el archivo sera una imagen de un producto o de un usuario
    let tipo = req.params.tipo;
    let id = req.params.id;
    // Si no hay ningun archivo
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        })
    }

    // Validacion de tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
            }
        })
    }

    // Si si viene un archivo
    // 'archivo' es el nombre del campo del body en la peticion
    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.'); // Segmenta el nombre del archivo por cada '.' que exista
    let extension = nombreCortado[nombreCortado.length - 1]; // La extension esta en la ultima posicion del arreglo anterior

    // Restringir a un solo tipo de archivo
    //Extensiones permitidas
    let enxtensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (enxtensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + enxtensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    // Cambiar el nombre del archivo
    // 1234as56ds7fd8f9-123.jpg
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    // Mover el archivo
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {
    // Revisar si el usuario existe
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no existe el usuario
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreArchivo;

        // Guardar en DB
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        })
    })
}

function imagenProducto(id, res, nombreArchivo) {
    // Revisar si el producto existe
    Producto.findById(id, (err, prodcutoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no existe el producto
        if (!prodcutoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(prodcutoDB.img, 'productos');
        prodcutoDB.img = nombreArchivo;

        // Guardar en DB
        prodcutoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        })
    })
}

function borraArchivo(nombreImagen, tipo) {
    // Confirmar que el Path de la imagen exista
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        // True si existe, False si no existe
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;