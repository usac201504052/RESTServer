const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Para poder tomar los datos del usuario que creo la nueva categoria
//const Usuario = require('./usuario')

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es obligatoria']
    },
    usuario: {
        type: Schema.Types.ObjectId, //Schema.Types.ObjectId
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema);