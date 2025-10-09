import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
});

// Add authorization header if token exists
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('adminToken');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export const setAuthToken = (token: string | null, rememberMe: boolean = false) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('adminToken', token);
    
    // Set expiration date if remember me is enabled
    if (rememberMe) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 14); // 14 days
      localStorage.setItem('adminTokenExpiration', expirationDate.toISOString());
    } else {
      localStorage.removeItem('adminTokenExpiration');
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiration');
  }
};

export const isTokenExpired = (): boolean => {
  const expirationDate = localStorage.getItem('adminTokenExpiration');
  if (!expirationDate) {
    // If no expiration is set, token is valid for the session
    return false;
  }
  
  const expiration = new Date(expirationDate);
  return new Date() > expiration;
};

// API functions
export const adminApi = {
  login: (password: string) => api.post('/api/admin/login', { password }),
  verify: (token: string) => api.post('/api/admin/verify', { token }),
};

export const eventsApi = {
  getAll: () => api.get('/api/events'),
  getBySlug: (slug: string) => api.get(`/api/events/${slug}`),
  create: (data: any) => api.post('/api/events', data),
  update: (id: string, data: any) => api.put(`/api/events/${id}`, data),
  delete: (id: string) => api.delete(`/api/events/${id}`),
  reset: (id: string, resetParticipants: boolean) => 
    api.post(`/api/events/${id}/reset`, { resetParticipants }),
};

export const classesApi = {
  getByEvent: (eventId: string) => api.get(`/api/classes/event/${eventId}`),
  create: (data: any) => api.post('/api/classes', data),
  update: (id: string, data: any) => api.put(`/api/classes/${id}`, data),
  delete: (id: string) => api.delete(`/api/classes/${id}`),
};

export const participantsApi = {
  getByEvent: (eventId: string) => api.get(`/api/participants/event/${eventId}`),
  getById: (id: string) => api.get(`/api/participants/${id}`),
  search: (query: string) => api.get(`/api/participants/search/${query}`),
  register: (data: any) => api.post('/api/participants/register', data),
  create: (data: any) => api.post('/api/participants', data),
  update: (id: string, data: any) => api.put(`/api/participants/${id}`, data),
  delete: (id: string) => api.delete(`/api/participants/${id}`),
  importCSV: (eventId: string, file: File, encoding: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('encoding', encoding);
    return api.post('/api/participants/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportCSV: (eventId: string) => api.get(`/api/participants/export/${eventId}`, {
    responseType: 'blob',
  }),
  assignEPC: (id: string, epc: string) => api.post(`/api/participants/${id}/assign-epc`, { epc }),
};

export const passagesApi = {
  getByEvent: (eventId: string, limit?: number) => 
    api.get(`/api/passages/event/${eventId}`, { params: { limit } }),
  getByParticipant: (participantId: string) => 
    api.get(`/api/passages/participant/${participantId}`),
  create: (data: any) => api.post('/api/passages', data),
  update: (id: string, data: any) => api.put(`/api/passages/${id}`, data),
  delete: (id: string) => api.delete(`/api/passages/${id}`),
};

export const resultsApi = {
  getByEvent: (eventSlug: string) => api.get(`/api/results/event/${eventSlug}`),
  getByClass: (eventSlug: string, className: string) => 
    api.get(`/api/results/event/${eventSlug}/class/${className}`),
  getByParticipant: (participantId: string) => 
    api.get(`/api/results/participant/${participantId}`),
};
