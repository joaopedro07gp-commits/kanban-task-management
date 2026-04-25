import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import Sidebar from '../components/Sidebar';
import { Plus, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// Decodificador de JWT para obter o e-mail do usuário
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function Dashboard({ setAuth }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [systemError, setSystemError] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [avatar, setAvatar] = useState(null);
  const [customName, setCustomName] = useState('');
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      setUser(decoded);
      if (decoded?.email) {
        const savedAvatar = localStorage.getItem(`avatar_${decoded.email}`);
        if (savedAvatar) setAvatar(savedAvatar);
        const savedName = localStorage.getItem(`name_${decoded.email}`);
        if (savedName) setCustomName(savedName);
      }
    }
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    fetchTasks();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const handleSaveName = (newName) => {
    setCustomName(newName);
    if (user?.email) {
      localStorage.setItem(`name_${user.email}`, newName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId;
      const taskId = draggableId;
      
      // Atualização otimista na UI
      setTasks(prev => prev.map(t => t.id.toString() === taskId ? { ...t, status: newStatus } : t));

      // Atualiza na API
      try {
        await fetch(`http://localhost:3001/api/tasks/${taskId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.error(err);
        fetchTasks(); // Reverte em caso de erro
      }
    }
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      setSystemError('');
      const isEditing = !!taskData.id;
      
      const endpoint = isEditing ? `http://localhost:3001/api/tasks/${taskData.id}` : 'http://localhost:3001/api/tasks';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!res.ok) throw new Error('Falha na comunicação com o servidor.');
      
      fetchTasks();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setSystemError('Ops! Tivemos um problema de conexão. O servidor backend está rodando?');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setSystemError('');
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor: ${res.status}`);
      }
      
      fetchTasks();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Detalhe do Erro:', err);
      setSystemError(`Ops! Erro ao excluir: ${err.message}`);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Carregando seu painel intergaláctico...</div>;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const rawName = user?.email ? user.email.split('@')[0] : '';
  const defaultFirstName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Visitante';
  const firstName = customName || defaultFirstName;

  const total = tasks.length;
  const totalCompleted = tasks.filter(t => t.status === 'done').length;
  const todo = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;

  const upcomingTasks = tasks
    .filter(t => t.status !== 'done' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* SIDEBAR LATERAL */}
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        customName={firstName}
        avatar={avatar}
        setAvatar={setAvatar}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px 60px', maxWidth: '1400px' }}>
        {systemError && (
          <div style={{ background: 'rgba(255, 0, 127, 0.1)', color: 'var(--accent)', border: '1px solid rgba(255,0,127,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong>Aviso:</strong> {systemError}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ color: 'var(--text-main)', fontSize: '2.8rem', margin: 0, fontWeight: 700 }}>
                {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{firstName}</span>!
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0', fontSize: '1.2rem' }}>
                Aqui está o resumo do seu progresso e as prioridades.
              </p>
            </header>

            {/* ESTATÍSTICAS E PRÓXIMAS TAREFAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              
              <div className="glass-panel" style={{ padding: '35px', display: 'flex', alignItems: 'center', gap: '30px', background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(26, 26, 36, 0.8))' }}>
                <div style={{ background: 'rgba(0, 255, 136, 0.2)', padding: '25px', borderRadius: '20px', color: 'var(--status-done)', boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}>
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '3.5rem', fontWeight: 800 }}>{totalCompleted}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Total de Concluídas</p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}>
                  <AlertTriangle size={24} color="var(--status-todo)" /> Próximas a Vencer
                </h3>
                
                {upcomingTasks.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    Nenhuma tarefa urgente. Relaxe!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {upcomingTasks.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '12px 18px', borderRadius: '10px', borderLeft: '4px solid var(--status-todo)' }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{t.title}</span>
                        <span style={{ color: 'var(--accent)', fontSize: '0.9rem', background: 'rgba(255,0,127,0.1)', padding: '4px 8px', borderRadius: '6px' }}>{t.due_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* KANBAN BOARD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.8rem' }}>Seu Quadro de Fluxo</h2>
              <span style={{ color: 'var(--text-muted)' }}>{todo} pendentes de {total} totais</span>
            </div>
            <KanbanBoard 
              tasks={tasks} 
              onDragEnd={handleDragEnd} 
              onTaskClick={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }} 
            />
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ color: 'var(--text-main)', fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>Minhas Tarefas</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gerencie todo o seu fluxo de trabalho em um só lugar.</p>
            </header>
            <KanbanBoard 
              tasks={tasks} 
              onDragEnd={handleDragEnd} 
              onTaskClick={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }} 
            />
          </>
        )}

        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
            <Activity size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <h2 style={{ color: 'var(--text-main)' }}>Em Construção</h2>
            <p>Esta página será disponibilizada nas próximas atualizações do KanbanFlow!</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ color: 'var(--text-main)', fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>Configurações</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gerencie suas preferências de perfil e exibição.</p>
            </header>

            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
              <h2 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Perfil do Usuário</h2>
              
              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>NOME DE EXIBIÇÃO</label>
                  <input 
                    type="text" 
                    className="input-glass" 
                    value={customName}
                    onChange={(e) => handleSaveName(e.target.value)}
                    placeholder={defaultFirstName}
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Seu nome fica salvo localmente no seu navegador para carregamento instantâneo.</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    width: '90px', height: '90px', borderRadius: '50%', 
                    background: avatar ? `url(${avatar}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '2.5rem', fontWeight: 'bold',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)', border: '2px solid var(--primary)'
                  }}>
                    {!avatar && firstName.charAt(0)}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '150px', textAlign: 'center' }}>
                    Para alterar a foto, clique no avatar no menu lateral!
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <h2 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Preferências do Site</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Modo de Visualização</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Alterne entre o Modo Escuro (Neon) e o Modo Claro.</p>
                </div>
                
                <button 
                  onClick={toggleTheme}
                  style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                    border: '1px solid var(--glass-border)',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    color: theme === 'dark' ? 'white' : 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: theme === 'light' ? '0 4px 15px var(--primary-glow)' : 'none'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {theme === 'dark' ? '🌙 Ativar Modo Claro' : '☀️ Ativar Modo Escuro'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FAB (Floating Action Button) */}
      <button 
        className="fab-button"
        onClick={openNewTaskModal}
        title="Criar nova tarefa"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* MODAL DE TAREFA */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask} 
        onDelete={handleDeleteTask}
        editingTask={editingTask} 
      />
    </div>
  );
}
