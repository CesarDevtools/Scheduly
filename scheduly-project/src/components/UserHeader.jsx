import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './Header.css';

const UserHeader = ({ employeeName }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener información del usuario actual
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Función para hacer logout
  const handleLogout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Limpiar localStorage aunque falle la llamada al backend
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  // Verificar si el usuario es Admin (roles es un array de números)
  const isAdmin = currentUser?.roles?.includes(5150);

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
            </svg>
          </div>
          <h1 className="logo-text">Scheduly</h1>
          {employeeName && (
            <span className="user-welcome">Bienvenido, {employeeName}</span>
          )}
        </div>
        
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          {/* Botón Gestión de Horarios - Solo Admin (ícono calendario) */}
          {isAdmin && (
            <button 
              className="logout-button"
              onClick={() => navigate('/management')}
              title="Gestión de Horarios"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Horarios
            </button>
          )}
          
          {/* Botón Empleados - Solo Admin (ícono usuarios) */}
          {isAdmin && (
            <button 
              className="logout-button"
              onClick={() => navigate('/employees')}
              title="Gestión de Empleados"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Empleados
            </button>
          )}

          {/* Botón Logout */}
          <button className="logout-button" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;