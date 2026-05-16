const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// Resposta padrão de erro do servidor
function serverError(res, status, message) {
  console.error(`[${status}] ${message}`);
  return res.status(status).json({ error: message });
}

router.get('/', authenticateToken, async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado.');
  try {
    const tasksRef = db.collection('Tasks');
    const snapshot = await tasksRef.where('user_id', '==', req.user.id).get();

    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    return serverError(res, 500, 'Erro ao buscar tarefas');
  }
});

router.post('/', authenticateToken, async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado.');
  const { title, description, status, priority, due_date, category } = req.body;
  if (!title) return serverError(res, 400, 'O título da tarefa é obrigatório');

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
    return serverError(res, 500, 'Erro ao criar tarefa');
  }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado.');
  const { status } = req.body;
  const { id } = req.params;

  try {
    const taskRef = db.collection('Tasks').doc(id);
    const doc = await taskRef.get();
    if (!doc.exists || doc.data().user_id !== req.user.id) {
      return serverError(res, 404, 'Tarefa não encontrada');
    }
    await taskRef.update({ status });
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (err) {
    return serverError(res, 500, 'Erro ao atualizar status');
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado.');
  const { title, description, priority, due_date, category, status } = req.body;
  const { id } = req.params;

  if (!title) return serverError(res, 400, 'O título da tarefa é obrigatório');

  try {
    const taskRef = db.collection('Tasks').doc(id);
    const doc = await taskRef.get();
    if (!doc.exists || doc.data().user_id !== req.user.id) {
      return serverError(res, 404, 'Tarefa não encontrada');
    }

    await taskRef.update({ title, description, priority, due_date, category, status });
    res.json({ message: 'Tarefa atualizada com sucesso' });
  } catch (err) {
    return serverError(res, 500, 'Erro ao atualizar tarefa');
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  if (!db) return serverError(res, 500, 'Banco de dados não inicializado.');
  const { id } = req.params;

  try {
    const taskRef = db.collection('Tasks').doc(id);
    const doc = await taskRef.get();
    if (!doc.exists || doc.data().user_id !== req.user.id) {
      return serverError(res, 404, 'Tarefa não encontrada');
    }
    await taskRef.delete();
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (err) {
    return serverError(res, 500, 'Erro ao deletar tarefa');
  }
});

module.exports = router;
