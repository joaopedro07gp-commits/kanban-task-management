const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar tabelas
db.serialize(() => {
  // Tabela de Usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  // Tabela de Tarefas
  db.run(`
    CREATE TABLE IF NOT EXISTS Tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      category TEXT,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    )
  `);

  // Tabela de Subtarefas
  db.run(`
    CREATE TABLE IF NOT EXISTS Subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE
    )
  `);

  // Tabela de Tags
  db.run(`
    CREATE TABLE IF NOT EXISTS Tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
