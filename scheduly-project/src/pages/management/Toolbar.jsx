import React from 'react';

const Toolbar = ({
  selectedWeek,
  setSelectedWeek,
  quickAssign,
  setQuickAssign,
  handleQuickAssign,
  employees,
  positions,
  timeSlots,
  weekDays,
  dayNames,
  filteredEmployees,
  setShowFilterModal,
  formatDateWithYear,
  goToCurrentWeek
}) => {
  // Navegar semana anterior
  const previousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  // Navegar semana siguiente
  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  return (
    <div className="toolbar-container">
      {/* Navegador de Semanas */}
      <div className="week-navigator">
        <button className="nav-button" onClick={previousWeek}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        
        <div className="week-display">
          <div className="week-text">
            {formatDateWithYear(weekDays[0])} - {formatDateWithYear(weekDays[6])}
          </div>
        </div>
        
        <div className="nav-right-buttons">
          <button className="nav-button today-button" onClick={goToCurrentWeek}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Hoy
          </button>
          
          <button className="nav-button" onClick={nextWeek}>
            Siguiente
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sección de Asignación Rápida */}
      <div className="quick-assign-section">
        <h3 className="quick-assign-title">Asignación Rápida</h3>
        <div className="quick-assign-controls">
          <select
            className="quick-select"
            value={quickAssign.employee}
            onChange={(e) => setQuickAssign(prev => ({ ...prev, employee: e.target.value }))}
          >
            <option value="">Empleado</option>
            {employees.map(emp => (
              <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>
            ))}
          </select>

          <select
            className="quick-select"
            value={quickAssign.position}
            onChange={(e) => setQuickAssign(prev => ({ ...prev, position: e.target.value }))}
          >
            <option value="">Posición</option>
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>

          <select
            className="quick-select"
            value={quickAssign.startTime}
            onChange={(e) => setQuickAssign(prev => ({ ...prev, startTime: e.target.value }))}
          >
            <option value="">Hora Inicio</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>

          <select
            className="quick-select"
            value={quickAssign.endTime}
            onChange={(e) => setQuickAssign(prev => ({ ...prev, endTime: e.target.value }))}
          >
            <option value="">Hora Fin</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>

          <select
            className="quick-select"
            value={quickAssign.selectedDay}
            onChange={(e) => setQuickAssign(prev => ({ ...prev, selectedDay: e.target.value }))}
          >
            <option value="">Día</option>
            {weekDays.map((day, index) => (
              <option key={day.toDateString()} value={index}>
                {dayNames[index]}
              </option>
            ))}
          </select>

          <textarea
            className="quick-select"
            placeholder="Nota (opcional)"
            value={quickAssign.nota || ''}
            onChange={(e) => setQuickAssign(prev => ({ ...prev, nota: e.target.value }))}
            maxLength="200"
            rows="1"
            style={{resize: 'none', minHeight: '38px', maxHeight: '38px'}}
          />

          <button className="assign-button" onClick={handleQuickAssign}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Asignar
          </button>

          <button 
            className="filter-button" 
            onClick={() => setShowFilterModal(true)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filtrar
            {filteredEmployees.length > 0 && (
              <span className="filter-badge">{filteredEmployees.length}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;