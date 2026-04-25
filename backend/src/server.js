const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'seu_segredo_super_seguro_aqui_para_jwt_do_kanban_123';

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
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    db.run(
      'INSERT INTO Users (email, password_hash) VALUES (?, ?)',
      [email, password_hash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }
          return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
        
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id: this.lastID, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro interno no servidor' });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  });
});

// --- ROTAS DE TAREFAS (CRUD) ---

app.get('/api/tasks', authenticateToken, (req, res) => {
  db.all('SELECT * FROM Tasks WHERE user_id = ?', [req.user.id], (err, tasks) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar tarefas' });
    res.json(tasks);
  });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, status, priority, due_date, category } = req.body;
  
  if (!title) return res.status(400).json({ error: 'O título da tarefa é obrigatório' });

  db.run(
    `INSERT INTO Tasks (user_id, title, description, status, priority, due_date, category) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, title, description, status || 'todo', priority || 'medium', due_date, category],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar tarefa' });
      res.status(201).json({ id: this.lastID, title, status, priority, due_date, category });
    }
  );
});

app.put('/api/tasks/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE Tasks SET status = ? WHERE id = ? AND user_id = ?',
    [status, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      res.json({ message: 'Status atualizado com sucesso' });
    }
  );
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { title, description, priority, due_date, category, status } = req.body;
  const { id } = req.params;

  if (!title) return res.status(400).json({ error: 'O título da tarefa é obrigatório' });

  db.run(
    `UPDATE Tasks 
     SET title = ?, description = ?, priority = ?, due_date = ?, category = ?, status = ? 
     WHERE id = ? AND user_id = ?`,
    [title, description, priority, due_date, category, status, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      res.json({ message: 'Tarefa atualizada com sucesso' });
    }
  );
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM Tasks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar tarefa' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      res.json({ message: 'Tarefa deletada com sucesso' });
    }
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
