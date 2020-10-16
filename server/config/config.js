// Constantes, variables globales

// ========================
// Puerto - detecta el puerto en el cual se esta escuchando
// ========================
process.env.PORT = process.env.PORT || 3000;


// ========================
// Entorno - detecta el entorno donde se esta trabajando
// ========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ========================
// Base de datos - detecta la base de datos que se esta usando
// ========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    // Si esta en el entorno de desarrollo
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //urlDB = 'mongodb+srv://javo_12:YVfFFy3xVJnpNCFB@cluster0.c3px8.mongodb.net/cafe';
    urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;


// 'mongodb+srv://cafe-user:YeNQJz5kjca0wCnq@cluster0.c3px8.mongodb.net/cafe'