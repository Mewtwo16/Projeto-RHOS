export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4040/api'

export const API_ENDPOINTS = {
  LOGIN: '/login',
  
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,
  
  PROFILES: '/profiles',
  PROFILE_BY_ID: (id: number) => `/profiles/${id}`,
  
  ALLOWED: '/allowed',
  
  POSITIONS: '/positions',
  POSITION_BY_ID: (id: number) => `/positions/${id}`,
  
  EMPLOYEES: '/employees',
  EMPLOYEE_BY_ID: (id: number) => `/employees/${id}`,
  EMPLOYEE_CALCULATE: (id: number) => `/employees/${id}/calcular`,
  
  LOGS: '/logs',
  
  HEALTH: '/health'
} as const
