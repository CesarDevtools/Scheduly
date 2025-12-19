import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Verificar si ya está logueado al cargar el componente
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      // Redirigir según el rol
      if (user.roles.includes(5150)) {
        navigate('/management');
      } else {
        navigate('/user');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Redirigir según el rol del usuario
      if (response.user.roles.includes(5150)) {
        // Es Admin - ir a gestión
        navigate('/management');
      } else {
        // Es Employee - ir a dashboard de usuario
        navigate('/user');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">Inicia sesión en tu cuenta</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingresa tu email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="login-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {error && (
              <div className="error-message" style={{
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #fecaca',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="#" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;