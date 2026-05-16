const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_seguro_aqui_para_jwt_do_kanban_123';

// Resposta padrão de erro do servidor
function serverError(res, status, message) {
  console.error(`[${status}] ${message}`);
  return res.status(status).json({ error: message });
}

router.post('/register', async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado. Contate o suporte.');

  const { email, password } = req.body;
  if (!email || !password) return serverError(res, 400, 'Email e senha são obrigatórios');

  try {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    if (!snapshot.empty) return serverError(res, 400, 'Email já cadastrado');

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUserRef = await usersRef.add({ email, password_hash });
    const token = jwt.sign({ id: newUserRef.id, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user: { id: newUserRef.id, email } });
  } catch (error) {
    console.error('Erro no register:', error);
    return serverError(res, 500, 'Erro interno no servidor ao cadastrar usuário');
  }
});

router.post('/login', async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado. Contate o suporte.');

  const { email, password } = req.body;
  try {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return serverError(res, 401, 'Credenciais inválidas');

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return serverError(res, 401, 'Credenciais inválidas');

    const token = jwt.sign({ id: userDoc.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: userDoc.id, email: user.email } });
  } catch (err) {
    console.error('Erro no login:', err);
    return serverError(res, 500, 'Erro interno no servidor ao fazer login');
  }
});

module.exports = router;
