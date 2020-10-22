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
// Vencimiento del token
// ========================
// 60segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ========================
// Seed (Firma)
// ========================
process.env.SEED = process.env.SEED || 'este-no-se-vera-en-github' // Crear una variable en heroku

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

// ========================
// Google Client ID
// ========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '65119283883-6p6co4vg9777ol9qefc7sj3fbj30ii8m.apps.googleusercontent.com';


// 'mongodb+srv://cafe-user:YeNQJz5kjca0wCnq@cluster0.c3px8.mongodb.net/cafe'