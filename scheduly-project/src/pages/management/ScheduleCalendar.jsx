import React from 'react';

const ScheduleCalendar = ({
  weekDays,
  dayNames,
  timeSlots,
  getDaySchedules,
  getEmployeeById,
  deleteSchedule,
  openScheduleModal,
  openEditModal,
  formatDate
}) => {
  return (
    <div className="schedule-calendar">
      <div className="calendar-scroll-container">
        {/* Cabecera con días */}
        <div className="calendar-header">
        {weekDays.map((day, index) => (
          <div key={day.toDateString()} className="day-header">
            <div className="day-name">{dayNames[index]}</div>
            <div className="day-date">{formatDate(day)}</div>
          </div>
        ))}
      </div>

      {/* Grid de horarios */}
      <div className="calendar-grid">
        {timeSlots.slice(0, 1).map(timeSlot => (
          <div key={timeSlot} className="time-row">
            {weekDays.map(day => (
              <div 
                key={`${day.toDateString()}-${timeSlot}`}
                className="time-cell"
                onClick={() => openScheduleModal(day, timeSlot)}
              >
                {(() => {
                  const daySchedules = getDaySchedules(day);
                  const groupedByEmployee = {};
                  
                  // Agrupar schedules por empleado
                  daySchedules.forEach(schedule => {
                    if (!groupedByEmployee[schedule.employee]) {
                      groupedByEmployee[schedule.employee] = [];
                    }
                    groupedByEmployee[schedule.employee].push(schedule);
                  });
                  
                  // Renderizar un block por empleado
                  return Object.entries(groupedByEmployee).map(([employeeId, employeeSchedules]) => {
                    // Usar employeeData si está disponible, sino buscar por ID
                    const employee = employeeSchedules[0].employeeData || getEmployeeById(employeeId);
                    
                    return (
                      <div
                        key={`employee-${employeeId}-${day.toDateString()}`}
                        className="schedule-block"
                        style={{ backgroundColor: employee?.color || '#gray' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(employeeSchedules, employee);
                        }}
                      >
                        <span className="schedule-employee">{employee?.name}</span>
                        {employeeSchedules.map((schedule) => (
                          <div key={schedule.id}>
                            <span className="schedule-position">{schedule.position}</span>
                            {schedule.position !== 'Día libre' && (
                              <span className="schedule-time">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            )}
                            {schedule.nota && (
                              <span className="schedule-note">
                                Nota: "{schedule.nota}"
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>
            ))}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;