const jwt = require('jsonwebtoken');

// ====================
// Verificar token
// ====================

let verificaToken = (req, res, next) => {

    // Leer el token que se envia en los headers de las peticiones
    let token = req.get('token');

    // Verificar el token
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        // Si hay algo malo con el token (expiro, no es valido, etc) saldra en el error
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        // El payload se encuentra en 'decoded'
        req.usuario = decoded.usuario;
        next();
    });

};

// ====================
// Verificar ADMIN Role
// ====================
let verificaAdminRol = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        })
    }
}

// ====================
// Verificar Token Por URL Para Imagen
// ====================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    // Verificar el token
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        // Si hay algo malo con el token (expiro, no es valido, etc) saldra en el error
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        // El payload se encuentra en 'decoded'
        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    verificaToken,
    verificaAdminRol,
    verificaTokenImg
}