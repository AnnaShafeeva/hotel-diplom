import { ID } from '../../common/types/type';

export interface User {
  _id?: ID;
  email: string;
  passwordHash: string;
  name: string;
  contactPhone?: string;
  role: 'client' | 'admin' | 'manager';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchUserParams {
  limit: number;
  offset: number;
  email?: string;
  name?: string;
  contactPhone?: string;
}

export interface IUserService {
  create(data: Partial<User>): Promise<User>;
  findById(id: ID): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(params: SearchUserParams): Promise<User[]>;
}
