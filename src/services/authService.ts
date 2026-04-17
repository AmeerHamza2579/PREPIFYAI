import { apiClient } from './api';

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  class_level?: string;  // For students: "9", "10", "11", or "12"
}

/**
 * User data from backend
 */
export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  class_level?: string;
  created_at: string;
}

/**
 * Login / register response from backend (token + profile in one payload).
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Auth Service - Handles authentication with backend
 */
export const authService = {
  /**
   * Login user and store token
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = (await apiClient.post('/auth/login', credentials, false)) as LoginResponse;
    if (response.access_token) {
      await apiClient.setToken(response.access_token);
    }
    return response;
  },

  /**
   * Register new user (returns token + user — no separate login call).
   */
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = (await apiClient.post('/auth/register', data, false)) as LoginResponse;
    if (response.access_token) {
      await apiClient.setToken(response.access_token);
    }
    return response;
  },

  /**
   * Logout user and remove token
   */
  logout: async (): Promise<void> => {
    try {
      // Try to call backend logout endpoint
      await apiClient.post('/auth/logout', {}, true);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue anyway - we'll remove the token
    } finally {
      // Always remove the token from storage
      await apiClient.removeToken();
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    return await apiClient.get('/users/me', true);
  },

  /**
   * Update current user profile
   */
  updateUser: async (updates: Partial<User>): Promise<User> => {
    return await apiClient.put('/users/me', updates, true);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh-token', {}, true);
    
    // Update stored token
    if (response.access_token) {
      await apiClient.setToken(response.access_token);
    }
    
    return response;
  },

  /**
   * Check if user has a valid token
   */
  hasToken: async (): Promise<boolean> => {
    const token = await apiClient.getToken();
    return !!token;
  },
};
