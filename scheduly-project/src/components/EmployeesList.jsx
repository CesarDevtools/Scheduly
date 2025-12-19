import React from 'react';
import './EmployeesList.css';

const EmployeesList = ({
  searchTerm,
  onSearch,
  onCreateEmployee,
  employees,
  onViewSchedules,
  onEditEmployee,
  onDeleteEmployee
}) => {
  return (
    <div className="employees-main-container">
      {/* Barra de acciones */}
      <div className="employees-actions">
        <div className="search-section">
          <div className="search-container">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar empleados por nombre o email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => onSearch('')}
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <button className="create-employee-btn" onClick={onCreateEmployee}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Empleado
        </button>
      </div>

      {/* Lista de empleados */}
      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map(employee => (
                <tr key={employee._id || employee.id}>
                  <td>
                    <div className="employee-name">
                      <div className="employee-avatar">
                        {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      {employee.name}
                    </div>
                  </td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td>
                    <div className="actions-container">
                      <button 
                        className="btn-view-schedule" 
                        onClick={() => onViewSchedules(employee)}
                        title="Ver horarios"
                      >
                        Horarios
                      </button>
                      <button 
                        className="btn-edit" 
                        onClick={() => onEditEmployee(employee)}
                        title="Editar empleado"
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-delete-single" 
                        onClick={() => onDeleteEmployee(employee)}
                        title="Eliminar empleado"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-employees">
                  {searchTerm ? 'No se encontraron empleados que coincidan con la búsqueda' : 'No hay empleados registrados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesList;