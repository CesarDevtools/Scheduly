import React, { useState, useEffect } from 'react';
import './ManagementPage.css';
import jsPDF from 'jspdf';
import Toolbar from './Toolbar';
import ScheduleCalendar from './ScheduleCalendar';
import HoursSummary from './HoursSummary';
import Header from '../../components/Header';
import apiService from '../../services/apiService';

const Management = () => {
  // Estado del usuario actual
  const [currentUser, setCurrentUser] = useState(null);

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para manejo de fechas y horarios
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [selectedEmployee] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    day: '',
    dayDate: null,
    startTime: '',
    endTime: '',
    position: '',
    employee: '',
    nota: ''
  });

  // Estados para asignación rápida
  const [quickAssign, setQuickAssign] = useState({
    employee: '',
    position: '',
    startTime: '',
    endTime: '',
    selectedDay: '',
    nota: ''
  });

  // Estados para filtro de empleados
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Estados para modal de edición/eliminación
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({
    schedules: [],
    employee: null,
    dayKey: ''
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editForm, setEditForm] = useState({
    position: '',
    startTime: '',
    endTime: '',
    nota: ''
  });

  // Estado para resumen de horas
  const [selectedEmployeeForSummary, setSelectedEmployeeForSummary] = useState('');

  // Funciones para cargar datos desde API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employeesData = await apiService.getEmployees();
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar empleados.');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (startDate, endDate) => {
    let loadingTimeout;
    try {
      // Solo mostrar loading si la operación toma más de 300ms
      loadingTimeout = setTimeout(() => setLoading(true), 300);
      
      const schedulesData = await apiService.getSchedulesByDateRange(startDate, endDate);
      
      // Convertir array de schedules a formato de objeto por día
      const schedulesByDay = {};
      console.log('Backend schedules data:', schedulesData); // Debug
      
      schedulesData.forEach(schedule => {
        // Convertir fecha del backend a formato toDateString() para compatibilidad
        const scheduleDate = new Date(schedule.date);
        const dayKey = scheduleDate.toDateString();
        console.log('Processing schedule:', schedule, 'dayKey:', dayKey); // Debug
        
        if (!schedulesByDay[dayKey]) {
          schedulesByDay[dayKey] = [];
        }
        schedulesByDay[dayKey].push({
          id: schedule._id,
          employee: schedule.employee._id || schedule.employee, // ID del empleado
          employeeData: schedule.employee, // Objeto completo del empleado (name, color, etc)
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          position: schedule.position,
          nota: schedule.nota || '' // Incluir la nota
        });
      });
      
      setSchedules(schedulesByDay);
    } catch (err) {
      console.error('Error loading schedules:', err);
      setError('Error al cargar horarios.');
    } finally {
      // Cancelar el timeout y limpiar loading
      clearTimeout(loadingTimeout);
      setLoading(false);
    }
  };

  // Obtener usuario actual del localStorage y cargar datos
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    loadEmployees();
  }, []);

  // Cargar horarios cuando cambie la semana seleccionada
  useEffect(() => {
    if (selectedWeek) {
      const startOfWeek = new Date(selectedWeek);
      // Calcular lunes como primer día de la semana
      const dayOfWeek = selectedWeek.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(selectedWeek.getDate() - daysFromMonday);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      

      
      loadSchedules(startOfWeek, endOfWeek);
    }
  }, [selectedWeek]);

  // Lista de empleados (cargada desde API)
  const [employees, setEmployees] = useState([]);

  // Posiciones de trabajo
  const positions = [
    'Abrir kiosko',
    'Cafetera',
    'Medio',
    'Mercancia',
    'Caja',
    'Día libre'
  ];

  // Horas del día (6:00 AM a 10:00 PM) cada 30 minutos
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) { // No agregar :30 para las 22:00 (última hora)
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Obtener días de la semana seleccionada
  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedWeek);
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];



  // Ir a la semana actual
  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

  // Formatear fecha con año para el selector de semanas
  const formatDateWithYear = (date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Abrir modal para asignar horario
  const openScheduleModal = (day, timeSlot) => {
    const dayKey = day.toDateString();
    setModalData({
      day: dayKey,
      dayDate: day, // Guardamos también el objeto Date original
      startTime: timeSlot,
      endTime: timeSlot,
      position: '',
      employee: selectedEmployee
    });
    setShowModal(true);
  };

  // Abrir modal para editar/eliminar schedule
  const openEditModal = (schedules, employee) => {
    const dayKey = schedules[0].day; // Todos los schedules son del mismo día
    setEditModalData({
      schedules,
      employee,
      dayKey
    });
    setShowEditModal(true);
  };

  // Guardar horario
  const saveSchedule = async () => {
    if (!modalData.employee || !modalData.position || !modalData.startTime || !modalData.endTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      
      // Usar el objeto Date original o parsearlo como fallback
      const dayDate = modalData.dayDate || new Date(modalData.day);
      const dateString = dayDate.toISOString().split('T')[0];
      
      const scheduleData = {
        employee: modalData.employee,
        date: dateString,
        startTime: modalData.startTime,
        endTime: modalData.endTime,
        position: modalData.position,
        nota: modalData.nota || ''
      };

      const newSchedule = await apiService.createSchedule(scheduleData);
      
      // Obtener datos completos del empleado
      const employeeData = getEmployeeById(modalData.employee);
      
      // Actualizar estado local con el nuevo horario
      setSchedules(prev => ({
        ...prev,
        [modalData.day]: [...(prev[modalData.day] || []), {
          id: newSchedule._id,
          employee: newSchedule.employee._id || newSchedule.employee,
          employeeData: employeeData, // Objeto completo del empleado
          position: newSchedule.position,
          startTime: newSchedule.startTime,
          endTime: newSchedule.endTime,
          nota: newSchedule.nota || '',
          day: modalData.day
        }]
      }));

      setShowModal(false);
      setModalData({
        day: '',
        dayDate: null,
        startTime: '',
        endTime: '',
        position: '',
        employee: '',
        nota: ''
      });
      setError(null);
    } catch (err) {
      console.error('Error creating schedule:', err);
      setError('Error al crear horario. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar horario
  const deleteSchedule = async (dayKey, scheduleId) => {
    try {
      setLoading(true);
      
      console.log('Deleting schedule:', scheduleId);
      await apiService.deleteSchedule(scheduleId);
      console.log('Schedule deleted successfully');
      
      // Recargar datos desde el servidor
      console.log('Reloading schedules...');
      const startOfWeek = new Date(selectedWeek);
      const dayOfWeek = selectedWeek.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(selectedWeek.getDate() - daysFromMonday);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      await loadSchedules(startOfWeek, endOfWeek);
      console.log('Schedules reloaded successfully');
      
      setError(null);
    } catch (err) {
      console.error('Error in deleteSchedule:', err);
      setError('Error al eliminar horario. Por favor, intenta de nuevo.');
      // No recargar si hay error, mantener estado actual
    } finally {
      setLoading(false);
    }
  };

  // Eliminar todos los horarios del empleado en un día específico
  const deleteEmployeeSchedules = async () => {
    try {
      setLoading(true);
      const { schedules: employeeSchedules } = editModalData;
      
      console.log('Deleting all employee schedules:', employeeSchedules.length);
      
      // Eliminar todos los schedules del empleado
      for (const schedule of employeeSchedules) {
        await apiService.deleteSchedule(schedule.id);
      }
      
      console.log('All employee schedules deleted successfully');
      
      // Cerrar el modal primero
      setEditModalData(null);
      setShowEditModal(false);
      
      // Recargar datos desde el servidor
      console.log('Reloading schedules after delete all...');
      const startOfWeek = new Date(selectedWeek);
      const dayOfWeek = selectedWeek.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(selectedWeek.getDate() - daysFromMonday);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      await loadSchedules(startOfWeek, endOfWeek);
      console.log('Schedules reloaded successfully after delete all');
      
      setError(null);
    } catch (err) {
      console.error('Error in deleteEmployeeSchedules:', err);
      setError('Error al eliminar horarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar edición de un horario específico
  const startEditSchedule = (schedule) => {
    setEditingSchedule(schedule.id);
    setEditForm({
      position: schedule.position,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      nota: schedule.nota || ''
    });
  };

  // Cancelar edición
  const cancelEditSchedule = () => {
    setEditingSchedule(null);
    setEditForm({
      position: '',
      startTime: '',
      endTime: '',
      nota: ''
    });
  };

  // Guardar edición de horario
  const saveEditSchedule = async () => {
    if (!editForm.position || !editForm.startTime || !editForm.endTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating schedule:', editingSchedule, 'with data:', editForm); // Debug
      
      const updateData = {
        position: editForm.position,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        nota: editForm.nota || ''
      };

      const updatedSchedule = await apiService.updateSchedule(editingSchedule, updateData);
      console.log('Schedule updated successfully:', updatedSchedule); // Debug

      // Recargar los horarios en lugar de actualizar manualmente el estado
      const startOfWeek = new Date(selectedWeek);
      const dayOfWeek = selectedWeek.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(selectedWeek.getDate() - daysFromMonday);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      await loadSchedules(startOfWeek, endOfWeek);

      // Cerrar el modal de edición
      setEditingSchedule(null);
      setEditForm({
        position: '',
        startTime: '',
        endTime: '',
        nota: ''
      });
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Error al actualizar horario. Por favor, intenta de nuevo.');
      // No cerrar el modal si hay error para que el usuario pueda reintentar
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un horario específico
  const deleteSpecificSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      
      console.log('Deleting specific schedule:', scheduleId);
      await apiService.deleteSchedule(scheduleId);
      console.log('Specific schedule deleted successfully');
      
      // Cerrar el modal primero
      setEditModalData(null);
      
      // Recargar datos desde el servidor
      console.log('Reloading schedules after specific delete...');
      const startOfWeek = new Date(selectedWeek);
      const dayOfWeek = selectedWeek.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(selectedWeek.getDate() - daysFromMonday);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      await loadSchedules(startOfWeek, endOfWeek);
      console.log('Schedules reloaded successfully after specific delete');
      
      setError(null);
    } catch (err) {
      console.error('Error in deleteSpecificSchedule:', err);
      setError('Error al eliminar horario. Por favor, intenta de nuevo.');
      // Mantener modal abierto si hay error
    } finally {
      setLoading(false);
    }

    // Cancelar edición si estaba editando este horario
    if (editingSchedule === scheduleId) {
      cancelEditSchedule();
    }
  };

  // Obtener horarios de un día específico
  const getDaySchedules = (day) => {
    const dayKey = day.toDateString();
    const daySchedules = schedules[dayKey] || [];
    
    // Si hay filtros activos, filtrar por empleados seleccionados
    if (filteredEmployees.length > 0) {
      return daySchedules.filter(schedule => 
        filteredEmployees.includes(schedule.employee.toString())
      );
    }
    
    return daySchedules;
  };

  // Manejar filtro de empleados
  const toggleEmployeeFilter = (employeeId) => {
    if (!employeeId) return;
    
    setFilteredEmployees(prev => {
      const employeeIdStr = employeeId.toString();
      if (prev.includes(employeeIdStr)) {
        return prev.filter(id => id !== employeeIdStr);
      } else {
        return [...prev, employeeIdStr];
      }
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilteredEmployees([]);
  };

  // Calcular horas totales de un empleado en la semana
  const calculateEmployeeHours = (employeeId) => {
    if (!employeeId) return 0;
    
    let totalMinutes = 0;
    
    // Recorrer todos los días de la semana
    weekDays.forEach(day => {
      const dayKey = day.toDateString();
      const daySchedules = schedules[dayKey] || [];
      
      // Encontrar horarios de este empleado en este día
      const employeeSchedules = daySchedules.filter(schedule => 
        schedule.employee.toString() === employeeId.toString()
      );
      
      // Sumar minutos de cada horario
      employeeSchedules.forEach(schedule => {
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
        
        const startTimeInMinutes = startHour * 60 + startMin;
        const endTimeInMinutes = endHour * 60 + endMin;
        
        totalMinutes += (endTimeInMinutes - startTimeInMinutes);
      });
    });
    
    // Convertir minutos a horas y minutos
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, totalMinutes };
  };

  // Formatear horas para mostrar
  const formatHours = (hoursData) => {
    if (hoursData.totalMinutes === 0) return '0 horas';
    if (hoursData.minutes === 0) return `${hoursData.hours} horas`;
    return `${hoursData.hours}h ${hoursData.minutes}m`;
  };

  // Generar y descargar PDF del calendario
  const generatePDF = () => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Configuración mejorada
    const margin = 20;
    const headerHeight = 15;
    const cellWidth = (pageWidth - 2 * margin) / 7;
    
    // ===== ENCABEZADO PROFESIONAL =====
    // Fondo del encabezado
    pdf.setFillColor(30, 58, 138); // Azul oscuro profesional
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo/Icono (círculo decorativo)
    pdf.setFillColor(59, 130, 246);
    pdf.circle(margin + 8, 22, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('S', margin + 8, 25, { align: 'center' });
    
    // Título principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SCHEDULY', margin + 25, 20);
    
    // Subtítulo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const weekTitle = `Horarios Semanales - ${formatDateWithYear(weekDays[0])} al ${formatDateWithYear(weekDays[6])}`;
    pdf.text(weekTitle, margin + 25, 30);
    
    // Información de generación
    pdf.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Generado: ${currentDate}`, pageWidth - margin, 35, { align: 'right' });
    
    let currentY = 55;
    
    // ===== TABLA DE HORARIOS MEJORADA =====
    // Cabecera de días con gradiente simulado
    pdf.setFillColor(59, 130, 246);
    pdf.setDrawColor(45, 110, 220);
    pdf.setLineWidth(0.5);
    
    dayNames.forEach((dayName, index) => {
      const x = margin + (index * cellWidth);
      
      // Fondo de cabecera con bordes redondeados simulados
      pdf.setFillColor(59, 130, 246);
      pdf.rect(x, currentY, cellWidth, headerHeight, 'FD');
      
      // Línea decorativa en la parte superior
      pdf.setDrawColor(96, 165, 250);
      pdf.setLineWidth(1);
      pdf.line(x, currentY, x + cellWidth, currentY);
      
      // Texto de día
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const dayText = `${dayName.toUpperCase()}`;
      const dateText = formatDate(weekDays[index]);
      
      // Día de la semana
      pdf.text(dayText, x + cellWidth / 2, currentY + 6, { align: 'center' });
      // Fecha
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(dateText, x + cellWidth / 2, currentY + 11, { align: 'center' });
    });
    
    currentY += headerHeight;
    
    // Preparar datos de todos los días agrupados por empleado
    const allDaysData = weekDays.map(day => {
      const daySchedules = getDaySchedules(day);
      const groupedByEmployee = {};
      
      daySchedules.forEach(schedule => {
        if (!groupedByEmployee[schedule.employee]) {
          groupedByEmployee[schedule.employee] = [];
        }
        groupedByEmployee[schedule.employee].push(schedule);
      });
      
      return {
        day,
        employees: Object.entries(groupedByEmployee)
      };
    });
    
    // Determinar cuántas páginas necesitamos (máximo 3 empleados por columna por página)
    const maxEmployeesPerPage = 3;
    let maxEmployeesInAnyDay = 0;
    allDaysData.forEach(dayData => {
      maxEmployeesInAnyDay = Math.max(maxEmployeesInAnyDay, dayData.employees.length);
    });
    
    const totalPages = Math.ceil(maxEmployeesInAnyDay / maxEmployeesPerPage);
    
    // Función para renderizar una página
    const renderPage = (pageIndex) => {
      if (pageIndex > 0) {
        pdf.addPage();
        
        // Recrear encabezado
        pdf.setFillColor(30, 58, 138);
        pdf.rect(0, 0, pageWidth, 45, 'F');
        
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 8, 22, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('S', margin + 8, 25, { align: 'center' });
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SCHEDULY', margin + 25, 20);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        const weekTitle = `Horarios Semanales - ${formatDateWithYear(weekDays[0])} al ${formatDateWithYear(weekDays[6])} (Página ${pageIndex + 1})`;
        pdf.text(weekTitle, margin + 25, 30);
        
        pdf.setFontSize(10);
        const currentDate = new Date().toLocaleDateString('es-ES', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(`Generado: ${currentDate}`, pageWidth - margin, 35, { align: 'right' });
        
        // Recrear cabecera de días
        let headerY = 55;
        pdf.setFillColor(59, 130, 246);
        pdf.setDrawColor(45, 110, 220);
        pdf.setLineWidth(0.5);
        
        dayNames.forEach((dayName, index) => {
          const x = margin + (index * cellWidth);
          pdf.setFillColor(59, 130, 246);
          pdf.rect(x, headerY, cellWidth, headerHeight, 'FD');
          pdf.setDrawColor(96, 165, 250);
          pdf.setLineWidth(1);
          pdf.line(x, headerY, x + cellWidth, headerY);
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          const dayText = `${dayName.toUpperCase()}`;
          const dateText = formatDate(weekDays[index]);
          
          pdf.text(dayText, x + cellWidth / 2, headerY + 6, { align: 'center' });
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(dateText, x + cellWidth / 2, headerY + 11, { align: 'center' });
        });
        
        currentY = headerY + headerHeight;
      }
      
      // Calcular altura real necesaria basada en el contenido
      let maxRowHeight = 40; // Altura mínima
      
      allDaysData.forEach((dayData) => {
        const startEmployeeIndex = pageIndex * maxEmployeesPerPage;
        const endEmployeeIndex = startEmployeeIndex + maxEmployeesPerPage;
        const employeesForThisPage = dayData.employees.slice(startEmployeeIndex, endEmployeeIndex);
        
        if (employeesForThisPage.length > 0) {
          let dayHeight = 10; // padding inicial
          employeesForThisPage.forEach(([employeeId, employeeSchedules]) => {
            dayHeight += 8; // nombre del empleado
            employeeSchedules.forEach((schedule) => {
              dayHeight += 12; // posición + tiempo
              if (schedule.nota) {
                // Calcular líneas necesarias para la nota
                const notaText = `Nota: "${schedule.nota}"`;
                pdf.setFontSize(7);
                const notaLines = pdf.splitTextToSize(notaText, cellWidth - 6);
                dayHeight += notaLines.length * 4; // 4mm por línea de nota
              }
              dayHeight += 2; // separación entre horarios
            });
            dayHeight += 4; // separación entre empleados
          });
          maxRowHeight = Math.max(maxRowHeight, dayHeight + 10); // +10 para padding final
        }
      });
      
      const rowHeight = maxRowHeight;
      
      // Renderizar contenido de días
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      
      allDaysData.forEach((dayData, dayIndex) => {
        const x = margin + (dayIndex * cellWidth);
        
        // Fondo alternativo para días
        if (dayIndex % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(x, currentY, cellWidth, rowHeight, 'F');
        }
        
        // Bordes de celda
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, currentY, cellWidth, rowHeight, 'D');
        
        // Obtener empleados para esta página (máximo 3)
        const startEmployeeIndex = pageIndex * maxEmployeesPerPage;
        const endEmployeeIndex = startEmployeeIndex + maxEmployeesPerPage;
        const employeesForThisPage = dayData.employees.slice(startEmployeeIndex, endEmployeeIndex);
        
        if (employeesForThisPage.length > 0) {
          const padding = 3;
          let employeeY = currentY + padding + 2;
          const maxTextWidth = cellWidth - (padding * 2);
          
          employeesForThisPage.forEach(([employeeId, employeeSchedules], empIndex) => {
            const employee = getEmployeeById(employeeId);
            const employeeName = employee ? employee.name : 'N/A';
            
            // Fondo sutil para cada empleado
            if (empIndex % 2 === 1) {
              pdf.setFillColor(245, 247, 250);
              pdf.rect(x + 1, employeeY - 2, cellWidth - 2, employeeSchedules.length * 10 + 8, 'F');
            }
            
            // Nombre del empleado
            pdf.setTextColor(30, 58, 138);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            
            let displayName = employeeName;
            if (pdf.getTextWidth(displayName) > maxTextWidth) {
              while (pdf.getTextWidth(displayName + '...') > maxTextWidth && displayName.length > 3) {
                displayName = displayName.slice(0, -1);
              }
              displayName += '...';
            }
            
            pdf.text(displayName, x + padding, employeeY + 3);
            employeeY += 8;
            
            // Horarios del empleado
            pdf.setTextColor(55, 65, 81);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            
            employeeSchedules.forEach((schedule) => {
              // Posición
              let positionText = schedule.position;
              pdf.setFont('helvetica', 'bold');
              if (pdf.getTextWidth(positionText) > maxTextWidth) {
                while (pdf.getTextWidth(positionText + '...') > maxTextWidth && positionText.length > 3) {
                  positionText = positionText.slice(0, -1);
                }
                positionText += '...';
              }
              pdf.text(positionText, x + padding, employeeY);
              employeeY += 5;
              
              // Horario
              pdf.setFont('helvetica', 'normal');
              const timeText = `${schedule.startTime} - ${schedule.endTime}`;
              pdf.text(timeText, x + padding, employeeY);
              employeeY += 5;
              
              // Nota (si existe)
              if (schedule.nota) {
                pdf.setFont('helvetica', 'italic');
                pdf.setFontSize(7);
                const notaText = `Nota: "${schedule.nota}"`;
                
                // Dividir el texto en múltiples líneas si es necesario
                const notaLines = pdf.splitTextToSize(notaText, maxTextWidth);
                
                // Renderizar cada línea de la nota
                notaLines.forEach((line, index) => {
                  pdf.text(line, x + padding, employeeY + (index * 4));
                });
                
                employeeY += notaLines.length * 4;
                pdf.setFontSize(8); // Restaurar tamaño
              }
              
              employeeY += 2;
            });
            
            employeeY += 4; // Separación entre empleados
          });
        } else {
          // Mensaje cuando no hay horarios en esta página
          pdf.setTextColor(156, 163, 175);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Sin horarios', x + cellWidth / 2, currentY + rowHeight / 2, { align: 'center' });
        }
      });
    };
    
    // Renderizar todas las páginas necesarias
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      renderPage(pageIndex);
    }
    
    
    // Descargar el PDF con nombre mejorado
    const startDate = formatDate(weekDays[0]).replace(/\//g, '-');
    const endDate = formatDate(weekDays[6]).replace(/\//g, '-');
    const fileName = `Scheduly_Horarios_${startDate}_al_${endDate}.pdf`;
    pdf.save(fileName);
  };

  // Obtener empleado por ID
  const getEmployeeById = (employeeId) => {
    return employees.find(emp => (emp._id || emp.id).toString() === employeeId.toString());
  };

  // Asignación rápida desde los selects
  const handleQuickAssign = async () => {
    if (!quickAssign.employee || !quickAssign.position || !quickAssign.startTime || !quickAssign.endTime || !quickAssign.selectedDay) {
      setError('Por favor completa todos los campos para asignar');
      return;
    }

    try {
      setLoading(true);
      
      const selectedDayDate = weekDays[parseInt(quickAssign.selectedDay)];
      const dayKey = selectedDayDate.toDateString();
      
      // Convertir fecha a formato ISO
      const dateString = selectedDayDate.toISOString().split('T')[0];
      
      const scheduleData = {
        employee: quickAssign.employee,
        date: dateString,
        startTime: quickAssign.startTime,
        endTime: quickAssign.endTime,
        position: quickAssign.position,
        nota: quickAssign.nota
      };

      const newSchedule = await apiService.createSchedule(scheduleData);
      
      // Obtener datos completos del empleado
      const employeeData = getEmployeeById(quickAssign.employee);
      
      // Actualizar estado local con el nuevo horario
      setSchedules(prev => ({
        ...prev,
        [dayKey]: [...(prev[dayKey] || []), {
          id: newSchedule._id,
          employee: newSchedule.employee._id || newSchedule.employee,
          employeeData: employeeData, // Objeto completo del empleado
          position: newSchedule.position,
          startTime: newSchedule.startTime,
          endTime: newSchedule.endTime,
          day: dayKey,
          nota: newSchedule.nota
        }]
      }));

      // Limpiar selects después de asignar
      setQuickAssign({
        employee: '',
        position: '',
        startTime: '',
        endTime: '',
        selectedDay: '',
        nota: ''
      });
      setError(null);
    } catch (err) {
      console.error('Error creating quick schedule:', err);
      setError('Error al crear horario rápido. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="management-container">
      {/* Header Principal */}
      <Header employeeName={currentUser?.name} />

      <div className="management-content">
        <div className="management-header">
          <h1 className="management-title">Gestión de Horarios</h1>
          <p className="management-subtitle">Administra los horarios de tu equipo</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message" style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px',
            border: '1px solid #fecaca',
            textAlign: 'center'
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{
                marginLeft: '10px',
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Indicador de carga */}
        {loading && (
          <div className="loading-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px'
              }}></div>
              Procesando...
            </div>
          </div>
        )}

      {/* Barra de Herramientas - Navegador + Asignación Rápida */}
      <Toolbar
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        quickAssign={quickAssign}
        setQuickAssign={setQuickAssign}
        handleQuickAssign={handleQuickAssign}
        employees={employees}
        positions={positions}
        timeSlots={timeSlots}
        weekDays={weekDays}
        dayNames={dayNames}
        filteredEmployees={filteredEmployees}
        setShowFilterModal={setShowFilterModal}
        formatDateWithYear={formatDateWithYear}
        goToCurrentWeek={goToCurrentWeek}
      />
      </div>

      {/* Calendario de Horarios */}
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

      {/* Barra de Resumen de Horas */}
      <HoursSummary
        generatePDF={generatePDF}
        selectedEmployeeForSummary={selectedEmployeeForSummary}
        setSelectedEmployeeForSummary={setSelectedEmployeeForSummary}
        employees={employees}
        calculateEmployeeHours={calculateEmployeeHours}
        formatHours={formatHours}
      />

      {/* Modal para asignar/editar horario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Asignar Horario</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Empleado:</label>
                <select 
                  value={modalData.employee}
                  onChange={(e) => setModalData(prev => ({...prev, employee: e.target.value}))}
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map(emp => {
                    const empId = emp._id || emp.id;
                    return empId ? (
                      <option key={empId} value={empId}>{emp.name}</option>
                    ) : null;
                  }).filter(Boolean)}
                </select>
              </div>

              <div className="form-group">
                <label>Posición:</label>
                <select 
                  value={modalData.position}
                  onChange={(e) => setModalData(prev => ({...prev, position: e.target.value}))}
                >
                  <option value="">Seleccionar posición</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nota (opcional):</label>
                <textarea 
                  value={modalData.nota || ''}
                  onChange={(e) => setModalData(prev => ({...prev, nota: e.target.value}))}
                  placeholder="Agregar una nota específica para este turno..."
                  rows="3"
                  maxLength="200"
                />
                <small className="char-count">
                  {(modalData.nota || '').length}/200 caracteres
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora inicio:</label>
                  <select 
                    value={modalData.startTime}
                    onChange={(e) => setModalData(prev => ({...prev, startTime: e.target.value}))}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Hora fin:</label>
                  <select 
                    value={modalData.endTime}
                    onChange={(e) => setModalData(prev => ({...prev, endTime: e.target.value}))}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-save"
                onClick={saveSchedule}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Filtro */}
      {showFilterModal && (
        <div className="modal-overlay">
          <div className="modal-content filter-modal">
            <div className="modal-header">
              <h3>Filtrar Empleados</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFilterModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="filter-description">
                Selecciona los empleados que quieres ver en el calendario:
              </p>
              
              <div className="employee-filter-list">
                {employees.map(emp => {
                  const empId = emp._id || emp.id;
                  return (
                    <label key={empId} className="employee-filter-item">
                      <input
                        type="checkbox"
                        checked={empId ? filteredEmployees.includes(empId.toString()) : false}
                        onChange={() => empId && toggleEmployeeFilter(empId)}
                      />
                      <div className="employee-color" style={{backgroundColor: emp.color}}></div>
                      <span className="employee-name">{emp.name}</span>
                    </label>
                  );
                })}
              </div>
              
              {filteredEmployees.length > 0 && (
                <button 
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-save"
                onClick={() => setShowFilterModal(false)}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar/eliminar horarios */}
      {showEditModal && editModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Horarios de {editModalData?.employee?.name || 'Empleado'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="schedule-details">
                <p className="schedule-info">
                  <strong>Empleado:</strong> {editModalData.employee?.name}
                </p>
                
                <h4>Horarios asignados:</h4>
                <div className="schedules-list">
                  {editModalData.schedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-item">
                      {editingSchedule === schedule.id ? (
                        // Formulario de edición
                        <div className="edit-form">
                          <div className="edit-form-row">
                            <select
                              value={editForm.position}
                              onChange={(e) => setEditForm(prev => ({...prev, position: e.target.value}))}
                              className="edit-select"
                            >
                              <option value="">Seleccionar posición</option>
                              {positions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="edit-form-row">
                            <select
                              value={editForm.startTime}
                              onChange={(e) => setEditForm(prev => ({...prev, startTime: e.target.value}))}
                              className="edit-select time-select"
                            >
                              <option value="">Hora inicio</option>
                              {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                            
                            <select
                              value={editForm.endTime}
                              onChange={(e) => setEditForm(prev => ({...prev, endTime: e.target.value}))}
                              className="edit-select time-select"
                            >
                              <option value="">Hora fin</option>
                              {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="edit-form-group">
                            <label>Nota:</label>
                            <textarea
                              value={editForm.nota}
                              onChange={(e) => setEditForm(prev => ({...prev, nota: e.target.value}))}
                              className="edit-textarea"
                              placeholder="Agregar nota específica..."
                              rows="2"
                              maxLength="200"
                            />
                            <small className="char-count">
                              {(editForm.nota || '').length}/200 caracteres
                            </small>
                          </div>
                          
                          <div className="edit-form-actions">
                            <button 
                              className="btn-edit-save"
                              onClick={saveEditSchedule}
                            >
                              Guardar
                            </button>
                            <button 
                              className="btn-edit-cancel"
                              onClick={cancelEditSchedule}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Vista normal
                        <div className="schedule-item-content">
                          <div className="schedule-item-info">
                            <span className="schedule-item-position">{schedule.position}</span>
                            <span className="schedule-item-time">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="schedule-item-actions">
                            <button 
                              className="btn-edit"
                              onClick={() => startEditSchedule(schedule)}
                            >
                              Editar
                            </button>
                            <button 
                              className="btn-delete-single"
                              onClick={() => deleteSpecificSchedule(schedule.id)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete"
                onClick={deleteEmployeeSchedules}
              >
                Eliminar Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
