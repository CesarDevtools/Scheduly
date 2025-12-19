// Configuración base de la API
const API_BASE_URL = 'http://localhost:3500';

// Función helper para hacer peticiones con autenticación
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Si el token expiró, redirigir al login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== AUTH SERVICES ====================
export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      // Guardar token y datos del usuario
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  // Logout
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Para enviar cookies
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener datos del usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ==================== EMPLOYEE SERVICES ====================
export const employeeService = {
  // Obtener todos los empleados (solo admins)
  getAllEmployees: async () => {
    return await apiRequest('/employees');
  },

  // Crear nuevo empleado (solo admins)
  createEmployee: async (employeeData) => {
    return await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  // Actualizar empleado (solo admins)
  updateEmployee: async (employeeId, employeeData) => {
    const dataWithId = {
      id: employeeId,
      ...employeeData
    };
    return await apiRequest('/employees', {
      method: 'PUT',
      body: JSON.stringify(dataWithId),
    });
  },

  // Eliminar empleado (solo admins)  
  deleteEmployee: async (employeeId) => {
    return await apiRequest('/employees', {
      method: 'DELETE',
      body: JSON.stringify({ id: employeeId }),
    });
  },

  // Obtener perfil del empleado logueado
  getMyProfile: async () => {
    return await apiRequest('/employees/me/profile');
  }
};

// ==================== SCHEDULE SERVICES ====================
export const scheduleService = {
  // Obtener todos los horarios (admins ven todos, empleados solo los suyos)
  getAllSchedules: async () => {
    return await apiRequest('/schedules');
  },

  // Obtener horarios por rango de fechas
  getSchedulesByDateRange: async (startDate, endDate) => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    return await apiRequest(`/schedules/date-range?${params}`);
  },

  // Obtener mis horarios (para empleados)
  getMySchedules: async () => {
    return await apiRequest('/schedules/my-schedules');
  },

  // Crear nuevo horario (solo admins)
  createSchedule: async (scheduleData) => {
    return await apiRequest('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },

  // Actualizar horario (solo admins)
  updateSchedule: async (scheduleId, scheduleData) => {
    const dataWithId = {
      id: scheduleId,
      ...scheduleData
    };
    return await apiRequest('/schedules', {
      method: 'PUT',
      body: JSON.stringify(dataWithId),
    });
  },

  // Eliminar horario (solo admins)
  deleteSchedule: async (scheduleId) => {
    return await apiRequest('/schedules', {
      method: 'DELETE',
      body: JSON.stringify({ id: scheduleId }),
    });
  }
};

// ==================== OTHER SERVICES ====================
export const utilityService = {
  // Obtener posiciones disponibles
  getPositions: async () => {
    return await apiRequest('/positions');
  }
};

// ==================== DEFAULT EXPORT ====================
const apiService = {
  // Auth methods
  login: authService.login,
  logout: authService.logout,
  refreshToken: authService.refreshToken,
  
  // Employee methods
  getEmployees: employeeService.getAllEmployees,
  createEmployee: employeeService.createEmployee,
  updateEmployee: employeeService.updateEmployee,
  deleteEmployee: employeeService.deleteEmployee,
  getMyProfile: employeeService.getMyProfile,
  
  // Schedule methods
  getSchedules: scheduleService.getAllSchedules,
  getSchedulesByDateRange: scheduleService.getSchedulesByDateRange,
  getMySchedules: scheduleService.getMySchedules,
  createSchedule: scheduleService.createSchedule,
  updateSchedule: scheduleService.updateSchedule,
  deleteSchedule: scheduleService.deleteSchedule,
  
  // Utility methods
  getPositions: utilityService.getPositions
};

export default apiService;