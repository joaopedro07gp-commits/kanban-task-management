import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard setAuth={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
