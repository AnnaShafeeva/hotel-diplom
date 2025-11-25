export interface User {
  _id?: string;
  email: string;
  name: string;
  contactPhone?: string;
  role: 'client' | 'admin' | 'manager';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  contactPhone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface SearchUserParams {
  limit: number;
  offset: number;
  email?: string;
  name?: string;
  contactPhone?: string;
}