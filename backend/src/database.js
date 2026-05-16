const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let db;

function parseServiceAccount(raw) {
  if (!raw) return null;
  
  let str = raw.trim();
  // Remove aspas simples ou duplas externas se houver
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1);
  }

  try {
    // Remove escapes de aspas se houver (comum em envs mal formatados)
    str = str.replace(/\\"/g, '"');
    
    const config = JSON.parse(str);
    
    // Corrige quebras de linha na private_key
    if (config.private_key && typeof config.private_key === 'string') {
      config.private_key = config.private_key.replace(/\\n/g, '\n');
    }
    return config;
  } catch (e) {
    console.error('❌ Erro crítico no JSON do Firebase:', e.message);
    return null;
  }
}

try {
  const rawConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!rawConfig) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT não encontrada no ambiente.');
  } else {
    const serviceAccount = parseServiceAccount(rawConfig);
    
    if (serviceAccount && !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      console.log('🔥 Firebase Admin SDK inicializado com sucesso.');
    } else if (admin.apps.length) {
      db = admin.firestore();
    } else {
      console.error('❌ Falha ao processar as credenciais do Firebase.');
    }
  }
} catch (error) {
  console.error('❌ Erro inesperado ao inicializar Firebase:', error.message);
}

module.exports = db;

