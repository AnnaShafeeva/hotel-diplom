import { api } from './api';
import { User, SearchUserParams } from '../types/user';

export const userService = {
  async getUsers(params: SearchUserParams): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users', { params });
    return response.data;
  },

  async getUsersManager(params: SearchUserParams): Promise<User[]> {
    const response = await api.get<User[]>('/manager/users', { params });
    return response.data;
  },

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    contactPhone?: string;
    role: 'client' | 'admin' | 'manager';
  }): Promise<User> {
    const response = await api.post<User>('/admin/users', userData);
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },
};