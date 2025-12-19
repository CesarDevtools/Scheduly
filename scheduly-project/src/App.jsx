import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ManagementPage from './pages/management/ManagementPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import UserPage from './pages/user/UserPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas solo para Admins */}
          <Route path="/management" element={
            <ProtectedRoute requiredRole={5150}>
              <ManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute requiredRole={5150}>
              <EmployeesPage />
            </ProtectedRoute>
          } />
          
          {/* Ruta para empleados (pueden acceder empleados y admins) */}
          <Route path="/user" element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          } />
          
          {/* Redirección de dashboard a user para compatibilidad */}
          <Route path="/dashboard" element={<Navigate to="/user" replace />} />
          
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
