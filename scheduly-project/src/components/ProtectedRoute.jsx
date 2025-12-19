import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Obtener información del usuario del localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('accessToken');

  // Si no hay token o usuario, redirigir al login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, verificarlo
  if (requiredRole && !user.roles.includes(requiredRole)) {
    // Si es empleado tratando de acceder a área de admin, enviarlo a su dashboard
    if (user.type === 'employee') {
      return <Navigate to="/dashboard" replace />;
    }
    // Para otros casos, mostrar acceso denegado
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        color: '#ef4444'
      }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;