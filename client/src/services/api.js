const BASE_URL = 'http://localhost:3001/api';

// Helper to make fetch requests with headers
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('aftermind_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

const api = {
  // Authentication
  auth: {
    signup: (credentials) => request('/auth/signup', { method: 'POST', body: JSON.stringify(credentials) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    me: () => request('/auth/me', { method: 'GET' }),
  },

  // Estate Profile
  estate: {
    get: (userId) => request(`/estate/${userId}`, { method: 'GET' }),
    update: (estateId, data) => request(`/estate/${estateId}`, { method: 'PUT', body: JSON.stringify(data) }),
    getCompletion: (estateId) => request(`/estate/${estateId}/completion`, { method: 'GET' }),
    getDetails: (estateId) => request(`/estate/${estateId}/details`, { method: 'GET' }),
  },

  // Chat Setup
  chat: {
    sendMessage: (message) => request('/chat/message', { method: 'POST', body: JSON.stringify({ message }) }),
    getHistory: (estateId) => request(`/chat/history/${estateId}`, { method: 'GET' }),
  },

  // Digital Accounts CRUD
  accounts: {
    create: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
  },

  // Important Documents CRUD
  documents: {
    create: (data) => request('/documents', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  },

  // Financial Assets CRUD
  assets: {
    create: (data) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/assets/${id}`, { method: 'DELETE' }),
  },

  // Trusted Contacts CRUD
  contacts: {
    create: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  },

  // Time Capsules CRUD
  capsules: {
    list: () => request('/capsules', { method: 'GET' }),
    create: (data) => request('/capsules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/capsules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/capsules/${id}`, { method: 'DELETE' }),
  },

  // Executor Commands (used during trigger & status logs)
  executor: {
    trigger: (estateId, triggeredBy) => request('/executor/trigger', { method: 'POST', body: JSON.stringify({ estateId, triggeredBy }) }),
    getStatus: (estateId) => request(`/executor/status/${estateId}`, { method: 'GET' }),
    getLog: (estateId) => request(`/executor/log/${estateId}`, { method: 'GET' }),
  },

  // Family Portal (Access code authenticated)
  family: {
    verifyCode: (accessCode) => request('/family/verify-code', { method: 'POST', body: JSON.stringify({ accessCode }) }),
    getEstateDetails: (accessCode) => request(`/family/estate/${accessCode}`, { method: 'GET' }),
    chat: (accessCode, message, chatHistory) => request('/family/chat', { method: 'POST', body: JSON.stringify({ accessCode, message, chatHistory }) }),
  }
};

export default api;
