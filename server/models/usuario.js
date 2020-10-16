// Encargado de trabajar el modelo de datos

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Para que valide que un campo o parametro tiene que ser unico y no puede
// repetirse.

// Roles validos
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

// Obtener el cascaron para crear esquemas
let Schema = mongoose.Schema;

// Definir esquema
// {reglas, cotroles, campos que tendra la coleccion}
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'] // El mensaje se mostrara si no se ingresa el nombre
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos, // Enumeracion de valores permitidos para este campo.
        required: [true, 'El rol es obligatorio']
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// El password no hay que regresarlo
// NO HACER FUNCION DE FLECHA
// El metodo toJSON se llama cuando se intenta imprimir
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password; // No tomar en cuenta la contrasenia al presentar el objeto JSON.

    return userObject;
}

// Para usar un plugin:
// Validar campos unicos
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

// Exportar el modelo
module.exports = mongoose.model('Usuario', usuarioSchema); // 'Usuario' tiene la configuracion de usuarioSchema.