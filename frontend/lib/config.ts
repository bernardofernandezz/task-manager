export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    signup: `${API_BASE_URL}/auth/signup`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
  },

  // Task endpoints
  tasks: {
    list: `${API_BASE_URL}/tasks`,
    create: `${API_BASE_URL}/tasks`,
    update: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/tasks/${id}`,
  },

  // Habit endpoints
  habits: {
    list: `${API_BASE_URL}/habits`,
    create: `${API_BASE_URL}/habits`,
    update: (id: string) => `${API_BASE_URL}/habits/${id}`,
    delete: (id: string) => `${API_BASE_URL}/habits/${id}`,
    stats: `${API_BASE_URL}/habits/stats`,
  },

  // Profile endpoints
  profile: {
    get: `${API_BASE_URL}/profile`,
    update: `${API_BASE_URL}/profile`,
    updateAvatar: `${API_BASE_URL}/profile/avatar`,
  },

  // Notification endpoints
  notifications: {
    list: `${API_BASE_URL}/notifications`,
    markAsRead: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    markAllAsRead: `${API_BASE_URL}/notifications/read-all`,
    delete: (id: string) => `${API_BASE_URL}/notifications/${id}`,
  },
}; 