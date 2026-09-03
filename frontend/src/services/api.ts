import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Note: Authorization header is set by AuthContext via Supabase session token
 * The AuthContext automatically updates this when the session changes
 */

// AI API
export const extractIntent = async (text: string) => {
  const response = await apiClient.post('/ai/extract', { text });
  return response.data;
};


export const getIntents = async () => {
  const response = await apiClient.get('/intents/');
  return response.data;
};

export const createIntent = async (data: any) => {
  const response = await apiClient.post('/intents/', data);
  return response.data;
};

export const updateIntent = async (intentId: string, data: any) => {
  const response = await apiClient.put(`/intents/${intentId}`, data);
  return response.data;
};

export const updateIntentStatus = async (intentId: string, status: string) => {
  const response = await apiClient.put(`/intents/${intentId}/status`, { status });
  return response.data;
};

export const deleteIntent = async (intentId: string) => {
  const response = await apiClient.delete(`/intents/${intentId}`);
  return response.data;
};

// Transactions API
export const getTransactions = async (skip: number = 0, limit: number = 100) => {
  const response = await apiClient.get(`/transactions/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const createTransaction = async (data: any) => {
  const response = await apiClient.post('/transactions/', data);
  return response.data;
};

export const capturePayment = async (transactionId: string, data: any) => {
  const response = await apiClient.post(`/transactions/${transactionId}/capture`, data);
  return response.data;
};

// Evaluations / Attack Lab API
export const runEvaluation = async (prompt: string, merchantId: string) => {
  const response = await apiClient.post('/evaluations/run', { prompt, merchant_id: merchantId });
  return response.data;
};

export const getEvaluation = async (evaluationId: string) => {
  const response = await apiClient.get(`/evaluations/${evaluationId}`);
  return response.data;
};

export const approveEvaluation = async (evaluationId: string) => {
  const response = await apiClient.post(`/evaluations/${evaluationId}/approve`);
  return response.data;
};

// Auth API
/**
 * DEPRECATED: Legacy login function
 * Only kept for backward compatibility during migration
 * Use Supabase auth methods instead (signInWithGoogle, signInWithApple, etc.)
 */
export const loginUser = async (userId: string = "usr_demo_123") => {
  const response = await apiClient.post('/auth/login', { user_id: userId });
  if (response.data.access_token) {
    localStorage.setItem('payguard_token', response.data.access_token);
  }
  return response.data;
};

/**
 * DEPRECATED: Legacy logout function
 * The logout flow is now handled by AuthContext
 */
export const logoutUser = () => {
  localStorage.removeItem('payguard_token');
  window.location.href = '/login';
};
