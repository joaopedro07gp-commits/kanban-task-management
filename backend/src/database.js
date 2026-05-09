const admin = require('firebase-admin');
require('dotenv').config();

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn("⚠️ AVISO: A variável FIREBASE_SERVICE_ACCOUNT não foi encontrada no .env!");
    console.warn("O Firebase Admin não foi inicializado corretamente.");
  } else {
    // A variável FIREBASE_SERVICE_ACCOUNT no Vercel (e no .env) deve conter o JSON da sua Service Account
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('🔥 Firebase Admin SDK inicializado e conectado ao Firestore.');
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin:', error.message);
}

const db = admin.firestore();

module.exports = db;

