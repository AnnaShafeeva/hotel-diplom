import { api } from './api';
import { LoginData, RegisterData, AuthResponse, User } from '../types/user';

export const authService = {
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await api.post<User>('/client/register', userData);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
};