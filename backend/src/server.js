const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_seguro_aqui_para_jwt_do_kanban_123';

// Middleware de Autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  try {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    if (!snapshot.empty) return res.status(400).json({ error: 'Email já cadastrado' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUserRef = await usersRef.add({ email, password_hash });
    const token = jwt.sign({ id: newUserRef.id, email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ token, user: { id: newUserRef.id, email } });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return res.status(401).json({ error: 'Credenciais inválidas' });

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: userDoc.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: userDoc.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// --- ROTAS DE TAREFAS (CRUD) ---

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasksRef = db.collection('Tasks');
    const snapshot = await tasksRef.where('user_id', '==', req.user.id).get();
    
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, status, priority, due_date, category } = req.body;
  if (!title) return res.status(400).json({ error: 'O título da tarefa é obrigatório' });

  try {
    const taskData = {
      user_id: req.user.id,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: due_date || null,
      category: category || null
    };
    const newTaskRef = await db.collection('Tasks').add(taskData);
    res.status(201).json({ id: newTaskRef.id, ...taskData });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

app.put('/api/tasks/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const taskRef = db.collection('Tasks').doc(id);
    const doc = await taskRef.get();
    if (!doc.exists || doc.data().user_id !== req.user.id) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    await taskRef.update({ status });
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { title, description, priority, due_date, category, status } = req.body;
  const { id } = req.params;

  if (!title) return res.status(400).json({ error: 'O título da tarefa é obrigatório' });

  try {
    const taskRef = db.collection('Tasks').doc(id);
    const doc = await taskRef.get();
    if (!doc.exists || doc.data().user_id !== req.user.id) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    await taskRef.update({ title, description, priority, due_date, category, status });
    res.json({ message: 'Tarefa atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const taskRef = db.collection('Tasks').doc(id);
    const doc = await taskRef.get();
    if (!doc.exists || doc.data().user_id !== req.user.id) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    await taskRef.delete();
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
