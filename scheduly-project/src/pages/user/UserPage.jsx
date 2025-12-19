import React, { useState, useEffect } from 'react';
import UserHeader from '../../components/UserHeader';
import ScheduleCalendar from '../management/ScheduleCalendar';
import apiService from '../../services/apiService';
import './UserPage.css';

const UserPage = () => {
  // Estados principales
  const [currentUser, setCurrentUser] = useState(null);
  const [userSchedules, setUserSchedules] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el calendario
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    return monday;
  });
  const [weekDays, setWeekDays] = useState([]);

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  // Cargar horarios del usuario para la semana
  const loadUserSchedules = async (startDate, endDate) => {
    if (!currentUser) return;
    
    let loadingTimeout;
    try {
      // Solo mostrar loading si la operación toma más de 300ms
      loadingTimeout = setTimeout(() => setLoading(true), 300);
      
      const schedulesData = await apiService.getMySchedules();
      
      // Filtrar solo los schedules de la semana actual
      const weekSchedules = schedulesData.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        
        // Normalizar fechas a medianoche para comparación correcta
        const normalizedScheduleDate = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        

        return normalizedScheduleDate >= normalizedStartDate && normalizedScheduleDate <= normalizedEndDate;
      });
      
      // Convertir array de schedules a formato de objeto por día
      const schedulesByDay = {};
      
      weekSchedules.forEach(schedule => {
        const scheduleDate = new Date(schedule.date);
        const dayKey = scheduleDate.toDateString();
        
        if (!schedulesByDay[dayKey]) {
          schedulesByDay[dayKey] = [];
        }
        
        schedulesByDay[dayKey].push({
          id: schedule._id,
          employee: schedule.employee._id || schedule.employee,
          employeeData: schedule.employee, // Datos completos del empleado desde el backend
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          position: schedule.position,
          date: schedule.date,
          nota: schedule.nota
        });
      });
      
      setUserSchedules(schedulesByDay);
      setError(null);
    } catch (err) {
      console.error('Error loading user schedules:', err);
      setError('Error al cargar tus horarios.');
    } finally {
      clearTimeout(loadingTimeout);
      setLoading(false);
    }
  };

  // Inicializar usuario desde localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Configurar semana actual
  useEffect(() => {
    const startOfWeek = new Date(currentWeekStart);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [currentWeekStart]);

  // Cargar horarios cuando cambia la semana o se carga el usuario
  useEffect(() => {
    if (currentUser && weekDays.length > 0) {
      const startOfWeek = weekDays[0];
      const endOfWeek = weekDays[6];

      loadUserSchedules(startOfWeek, endOfWeek);
    }
  }, [currentUser, weekDays]);

  // Navegar semanas
  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  // Ir a la semana actual
  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    setCurrentWeekStart(monday);
  };

  // Obtener horarios de un día específico
  const getDaySchedules = (date) => {
    const dayKey = date.toDateString();
    return userSchedules[dayKey] || [];
  };

  // Obtener empleado por ID (debería ser siempre el usuario actual)
  const getEmployeeById = (id) => {
    // Como solo mostramos horarios del usuario loggeado, siempre devolvemos currentUser
    return currentUser;
  };

  // Formatear fecha
  const formatDate = (date) => {
    return date.getDate().toString().padStart(2, '0');
  };

  // Formatear fecha para header
  const formatWeekRange = () => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleDateString('es-ES', { month: 'short' });
    const endMonth = end.toLocaleDateString('es-ES', { month: 'short' });
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
    }
  };

  // Funciones vacías para el calendario (solo vista)
  const openScheduleModal = () => {}; // No disponible para empleados
  const openEditModal = () => {}; // Solo vista, no edición
  const deleteSchedule = () => {}; // No disponible para empleados

  // Mostrar loading o error si no hay usuario
  if (!currentUser) {
    return (
      <div className="user-page-container">
        <div className="user-content">
          <div className="loading-message">Cargando información del usuario...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page-container">
      <UserHeader 
        employeeName={currentUser.name}
      />
      
      <div className="user-content">
        <div className="user-header">
          <h1 className="user-title">Mi Horario</h1>
          <p className="user-subtitle">Consulta tu horario semanal asignado</p>
          {error && (
            <div className="error-message" style={{color: 'red', marginTop: '10px'}}>
              {error}
            </div>
          )}
        </div>

        {/* Navegación de semana */}
        <div className="week-navigation">
          <button 
            className="nav-button" 
            onClick={() => navigateWeek(-1)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          
          <div className="week-info">
            <h2 className="week-title">{formatWeekRange()}</h2>
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
            
            <button 
              className="nav-button" 
              onClick={() => navigateWeek(1)}
            >
              Siguiente
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendario de horarios */}
        <div className="schedule-container">
          {loading && (
            <div className="loading-overlay" style={{
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.8)'
            }}>
              <div>Procesando...</div>
            </div>
          )}
          {!loading && (
            <ScheduleCalendar
              weekDays={weekDays}
              dayNames={dayNames}
              timeSlots={timeSlots}
              getDaySchedules={getDaySchedules}
              getEmployeeById={getEmployeeById}
              deleteSchedule={deleteSchedule}
              openScheduleModal={openScheduleModal}
              openEditModal={openEditModal}
              formatDate={formatDate}
            />
          )}
        </div>

        {/* Resumen de horarios */}
        <div className="schedule-summary">
          <h3>Resumen de la semana</h3>
          <div className="summary-grid">
            {weekDays.map((day, index) => {
              const daySchedules = getDaySchedules(day);
              const totalHours = daySchedules.reduce((total, schedule) => {
                const start = new Date(`1970-01-01T${schedule.startTime}`);
                const end = new Date(`1970-01-01T${schedule.endTime}`);
                return total + (end - start) / (1000 * 60 * 60);
              }, 0);

              return (
                <div key={day.toDateString()} className="summary-day">
                  <div className="summary-day-name">{dayNames[index]}</div>
                  <div className="summary-day-date">{formatDate(day)}</div>
                  <div className="summary-hours">
                    {totalHours > 0 ? `${totalHours}h` : 'Libre'}
                  </div>
                  {daySchedules.length > 0 && (
                    <div className="summary-positions">
                      {daySchedules.map(schedule => schedule.position).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;