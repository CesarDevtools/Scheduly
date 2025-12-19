import React from 'react';

const HoursSummary = ({
  generatePDF,
  selectedEmployeeForSummary,
  setSelectedEmployeeForSummary,
  employees,
  calculateEmployeeHours,
  formatHours
}) => {
  return (
    <div className="hours-summary-bar">
      <div className="summary-content">
        {/* Botón Descargar PDF */}
        <button className="download-pdf-button" onClick={generatePDF}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar PDF
        </button>
        
        <div className="summary-right-section">
          <div className="summary-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v10l7 4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Resumen de Horas Semanales
          </div>
          
          <div className="summary-controls">
            <select 
              value={selectedEmployeeForSummary}
              onChange={(e) => setSelectedEmployeeForSummary(e.target.value)}
              className="summary-employee-select"
            >
              <option value="">Seleccionar empleado...</option>
              {employees.map(emp => {
                const empId = emp._id || emp.id;
                return empId ? (
                  <option key={empId} value={empId}>{emp.name}</option>
                ) : null;
              }).filter(Boolean)}
            </select>
            
            {selectedEmployeeForSummary && (
              <div className="hours-display">
                <div className="employee-info">
                  <div 
                    className="employee-color-indicator"
                    style={{
                      backgroundColor: employees.find(emp => {
                        const empId = emp._id || emp.id;
                        return empId && empId.toString() === selectedEmployeeForSummary.toString();
                      })?.color || '#gray'
                    }}
                  ></div>
                  <span className="employee-summary-name">
                    {employees.find(emp => {
                      const empId = emp._id || emp.id;
                      return empId && empId.toString() === selectedEmployeeForSummary.toString();
                    })?.name}
                  </span>
                </div>
                
                <div className="hours-info">
                  <span className="hours-label">Total:</span>
                  <span className="hours-value">
                    {formatHours(calculateEmployeeHours(selectedEmployeeForSummary))}
                  </span>
                </div>
                
                {calculateEmployeeHours(selectedEmployeeForSummary).totalMinutes > 0 && (
                  <div className="additional-info">
                    <span className="hours-detail">
                      ({calculateEmployeeHours(selectedEmployeeForSummary).totalMinutes} minutos totales)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursSummary;