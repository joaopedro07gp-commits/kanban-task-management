const express = require('express');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

// Rotas de Autenticação
router.use('/api/auth', authRoutes);

// Rotas de Tarefas (CRUD)
router.use('/api/tasks', taskRoutes);

// Health check
router.get('/api/health', (req, res) => {
  if (!db) return res.status(500).json({ status: 'error', detail: 'Firebase não inicializado' });
  res.json({ status: 'ok', db: 'connected' });
});

// Aplicar o router tanto na raiz quanto no prefixo da Vercel
app.use('/_/backend', router);
app.use('/', router);

// Resposta para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});

module.exports = app;
