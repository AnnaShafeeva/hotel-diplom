export interface SearchRoomsParams {
  limit: number;
  offset: number;
  hotel?: string;
  isEnabled?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface HotelRoom {
  id: string;
  description: string;
  images: string[];
  hotel: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface Hotel {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHotelData {
  title: string;
  description: string;
}

export interface UpdateHotelData {
  title?: string;
  description?: string;
}