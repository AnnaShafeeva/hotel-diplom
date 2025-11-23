import { Types } from 'mongoose';

export interface PopulatedAuthor {
  _id: Types.ObjectId;
  name: string;
  email?: string;
}

export interface AuthorResponse {
  id: string;
  name: string;
}
