import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, onDelete, editingTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setCategory(editingTask.category || '');
      setDueDate(editingTask.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('');
      setDueDate('');
    }
    setError('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      setError('O título da tarefa é obrigatório.');
      return;
    }
    
    onSave({
      id: editingTask?.id,
      title,
      description,
      priority,
      category,
      due_date: dueDate,
      status: editingTask ? editingTask.status : 'todo'
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
        
        <h2 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          
          {editingTask && (
            <button 
              type="button"
              onClick={() => {
                if(window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
                  onDelete(editingTask.id);
                }
              }}
              style={{ background: 'rgba(255,0,127,0.1)', color: 'var(--accent)', border: '1px solid rgba(255,0,127,0.3)', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
            >
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </h2>

        {error && <div style={{ background: 'rgba(255,0,127,0.1)', borderLeft: '4px solid var(--accent)', color: 'var(--text-main)', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Título</label>
            <input className="input-glass" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Descrição</label>
            <textarea 
              className="input-glass" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows="3" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prioridade</label>
              <select className="input-glass" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low" style={{ background: 'var(--bg-dark)' }}>Baixa</option>
                <option value="medium" style={{ background: 'var(--bg-dark)' }}>Média</option>
                <option value="high" style={{ background: 'var(--bg-dark)' }}>Alta</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Categoria</label>
              <input className="input-glass" placeholder="Ex: Trabalho" value={category} onChange={e => setCategory(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Data Limite</label>
            <input type="date" className="input-glass" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer' }}>
              Cancelar
            </button>

            {editingTask && editingTask.status !== 'done' && (
              <button 
                type="button" 
                onClick={() => {
                  if (!title.trim()) return setError('O título é obrigatório.');
                  onSave({
                    id: editingTask.id, title, description, priority, category, due_date: dueDate, status: 'done'
                  });
                }} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 20px', borderRadius: '8px', background: 'rgba(0, 255, 136, 0.2)', border: '1px solid var(--status-done)', color: 'var(--status-done)', cursor: 'pointer', fontWeight: 600 }}
              >
                <CheckCircle size={18} /> Concluir
              </button>
            )}

            <button type="submit" className="btn-primary">
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
