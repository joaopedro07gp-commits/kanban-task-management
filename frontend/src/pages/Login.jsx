import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const API_URL = isProduction ? '/_/backend' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setAuth(true);
        navigate('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. O backend está rodando?');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '5px', fontSize: '2.5rem' }}>Kanban Flow</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
          {isLogin ? 'Bem-vindo de volta, produtivo!' : 'Crie sua conta para começar'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Seu E-mail"
            className="input-glass"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Sua Senha"
            className="input-glass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', textAlign: 'left' }}>* {error}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', fontSize: '1.1rem' }}>
            {isLogin ? 'Entrar no Dashboard' : 'Cadastrar e Acessar'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--secondary)',
            marginTop: '25px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Não tem uma conta? Crie aqui' : 'Já tem conta? Faça Login'}
        </button>
      </div>
    </div>
  );
}
