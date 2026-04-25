import { useState, useRef, useEffect } from 'react';
import { Home, CheckSquare, List, Settings, LogOut, Upload, Camera } from 'lucide-react';
import CameraModal from './CameraModal';

export default function Sidebar({ user, onLogout, activeTab, setActiveTab, customName, avatar, setAvatar }) {
  // Define o nome de exibição (customizado ou derivado do email)
  const name = customName || (user?.email ? user.email.split('@')[0] : 'Visitante');

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        if (user?.email) {
          localStorage.setItem(`avatar_${user.email}`, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = (dataUrl) => {
    setAvatar(dataUrl);
    if (user?.email) {
      localStorage.setItem(`avatar_${user.email}`, dataUrl);
    }
    setIsCameraOpen(false);
  };

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      height: 'calc(100vh - 40px)',
      position: 'sticky',
      top: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '30px 20px',
      margin: '20px 0 20px 20px',
      zIndex: 10
    }}>
      <h1 style={{ color: 'white', margin: '0 0 50px 10px', fontSize: '2.2rem', fontWeight: 800 }}>
        Kanban<span style={{ color: 'var(--primary)' }}>Flow</span>
      </h1>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <Home size={22} /> Painel Principal
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('tasks'); }} className={`sidebar-link ${activeTab === 'tasks' ? 'active' : ''}`}>
          <CheckSquare size={22} /> Minhas Tarefas
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('categories'); }} className={`sidebar-link ${activeTab === 'categories' ? 'active' : ''}`}>
          <List size={22} /> Categorias
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }} className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}>
          <Settings size={22} /> Configurações
        </a>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '25px', position: 'relative' }}>
        
        {/* MENU POPUP DO AVATAR */}
        {showAvatarMenu && (
          <div style={{ 
            position: 'absolute', 
            bottom: '80px', 
            left: '10px', 
            background: 'rgba(20, 20, 28, 0.95)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            padding: '10px', 
            borderRadius: '12px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            width: '200px'
          }}>
            <button 
              onClick={() => { fileInputRef.current.click(); setShowAvatarMenu(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Upload size={18} /> Enviar Arquivo
            </button>
            <button 
              onClick={() => { setIsCameraOpen(true); setShowAvatarMenu(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Camera size={18} /> Tirar Foto
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', padding: '0 10px' }}>
          <div 
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            title="Alterar foto de perfil"
            style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '50%', 
              background: avatar ? `url(${avatar}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--accent))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'border 0.2s, transform 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.border = '2px solid var(--primary)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {!avatar && name.charAt(0)}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '1.1rem' }}>
              {name}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Membro VIP</p>
          </div>
        </div>
        
        <button onClick={onLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <LogOut size={22} /> Sair da Conta
        </button>
      </div>

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={saveAvatar} 
      />
    </aside>
  );
}
