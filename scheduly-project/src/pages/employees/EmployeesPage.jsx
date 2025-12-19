import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import EmployeesList from '../../components/EmployeesList';
import apiService from '../../services/apiService';
import './EmployeesPage.css';

const EmployeesPage = () => {
  // Estado del usuario actual
  const [currentUser, setCurrentUser] = useState(null);

  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener nombre del color
  const getColorName = (hexColor) => {
    const colorNames = {
      '#3b82f6': 'Azul',
      '#10b981': 'Verde Esmeralda',
      '#f59e0b': 'Naranja',
      '#ef4444': 'Rojo',
      '#8b5cf6': 'Púrpura',
      '#ec4899': 'Rosa',
      '#06b6d4': 'Cian',
      '#84cc16': 'Lima',
      '#f97316': 'Naranja Oscuro',
      '#6366f1': 'Índigo',
      '#14b8a6': 'Verde Azulado',
      '#f43f5e': 'Rosa Intenso',
      '#a855f7': 'Violeta',
      '#22c55e': 'Verde Claro',
      '#eab308': 'Amarillo',
      '#64748b': 'Gris Pizarra'
    };
    return colorNames[hexColor.toLowerCase()] || 'Color Personalizado';
  };

  // Función para cargar empleados desde la API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const employeesData = await apiService.getEmployees();
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuario actual del localStorage y cargar empleados
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    loadEmployees();
  }, []);

  // Estado para empleados
  const [employees, setEmployees] = useState([]);

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  // Estado para formularios
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    color: '#3b82f6' // Color por defecto
  });

  // Limpiar formulario
  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '', color: '#3b82f6' });
  };

  // Abrir modal de crear
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Abrir modal de editar
  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      password: '', // No mostrar contraseña actual por seguridad
      color: employee.color || '#3b82f6'
    });
    setShowEditModal(true);
  };

  // Abrir modal de eliminar
  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  // Cerrar modales
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedEmployee(null);
    setError(null); // Limpiar errores al cerrar
    resetForm();
  };

  // Crear empleado
  const createEmployee = async () => {
    if (formData.name && formData.email && formData.phone && formData.password) {
      try {
        setLoading(true);
        const employeeData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          color: formData.color,
          roles: { Employee: 3001 } // Rol por defecto
        };
        
        await apiService.createEmployee(employeeData);
        await loadEmployees(); // Recargar lista
        closeModals();
        setError(null);
      } catch (err) {
        console.error('Error creating employee:', err);
        setError('Error al crear empleado. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Todos los campos son obligatorios.');
    }
  };

  // Editar empleado
  const updateEmployee = async () => {
    if (formData.name && formData.email && formData.phone) {
      try {
        setLoading(true);
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          color: formData.color
        };
        
        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        
        await apiService.updateEmployee(selectedEmployee._id, updateData);
        await loadEmployees(); // Recargar lista
        closeModals();
        setError(null);
      } catch (err) {
        console.error('Error updating employee:', err);
        setError('Error al actualizar empleado. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Nombre, email y teléfono son obligatorios.');
    }
  };

  // Eliminar empleado
  const deleteEmployee = async () => {
    try {
      setLoading(true);
      await apiService.deleteEmployee(selectedEmployee._id);
      await loadEmployees(); // Recargar lista
      closeModals();
      setError(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Error al eliminar empleado. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filtrar empleados por búsqueda
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Resetear página al buscar
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Navegar a horarios del empleado
  const viewEmployeeSchedules = (employee) => {
    // TODO: Implementar navegación con filtro
    console.log('Ver horarios de:', employee.name);
  };

  return (
    <div className="employees-container">
      <Header employeeName={currentUser?.name} />
      
      <div className="employees-content">
        <div className="employees-header">
          <h1 className="employees-title">Gestión de Empleados</h1>
          <p className="employees-subtitle">Administra el equipo de tu cafetería</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message" style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px',
            border: '1px solid #fecaca' 
          }}>
            {error}
          </div>
        )}

        {/* Estado de carga */}
        {loading ? (
          <div className="loading-state" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px'
              }}></div>
              Cargando empleados...
            </div>
          </div>
        ) : (
          /* Lista de empleados */
          <EmployeesList
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onCreateEmployee={openCreateModal}
            employees={currentEmployees}
            onViewSchedules={viewEmployeeSchedules}
            onEditEmployee={openEditModal}
            onDeleteEmployee={openDeleteModal}
          />
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} de {filteredEmployees.length} empleados
            </div>
            
            <div className="pagination-controls">
              <button 
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button 
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar Empleado */}
        {(showCreateModal || showEditModal) && (
          <div className="employees-modal-overlay" onClick={closeModals}>
            <div className="employees-modal" onClick={(e) => e.stopPropagation()}>
              <div className="employees-modal-header">
                <h3>{showCreateModal ? 'Nuevo Empleado' : 'Editar Empleado'}</h3>
                <button className="employees-modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="employees-modal-content">
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Ana García"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ana.garcia@cafeteria.com"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Número de Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234-567-8901"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">
                    {showCreateModal ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={showCreateModal ? 'Ingresa una contraseña segura' : 'Dejar vacío para mantener actual'}
                    className="form-input"
                  />
                  {showEditModal && (
                    <small className="password-hint">
                      Deja vacío si no deseas cambiar la contraseña
                    </small>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="color">Color del Empleado</label>
                  <div className="color-input-container">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="color-input"
                    />
                    <div className="color-info">
                      <div className="color-details">
                        <span className="color-name">{getColorName(formData.color)}</span>
                        <span className="color-code">{formData.color}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="employees-modal-footer">
                <button className="employees-btn-secondary" onClick={closeModals}>
                  Cancelar
                </button>
                <button 
                  className="employees-btn-primary" 
                  onClick={showCreateModal ? createEmployee : updateEmployee}
                >
                  {showCreateModal ? 'Crear Empleado' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar Empleado */}
        {showDeleteModal && selectedEmployee && (
          <div className="employees-modal-overlay" onClick={closeModals}>
            <div className="employees-modal employees-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="employees-modal-header">
                <h3>Eliminar Empleado</h3>
                <button className="employees-modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="employees-modal-content">
                <div className="delete-warning">
                  <div className="warning-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p>
                    ¿Estás seguro de que quieres eliminar a <strong>{selectedEmployee.name}</strong>?
                  </p>
                  <p className="warning-text">
                    Esta acción no se puede deshacer y también eliminará todos los horarios asignados a este empleado.
                  </p>
                </div>
              </div>
              <div className="employees-modal-footer">
                <button className="employees-btn-secondary" onClick={closeModals}>
                  Cancelar
                </button>
                <button className="employees-btn-danger" onClick={deleteEmployee}>
                  Eliminar Empleado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
