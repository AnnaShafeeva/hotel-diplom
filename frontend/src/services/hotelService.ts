import { api } from './api';
import { HotelRoom, SearchRoomsParams, Hotel, CreateHotelData, UpdateHotelData } from '../types/hotel';

export const hotelService = {
  async searchRooms(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const cleanParams: any = {
      limit: params.limit || 10,
      offset: params.offset || 0
    };
    
    if (params.hotel) cleanParams.hotel = params.hotel;
    if (params.isEnabled !== undefined) cleanParams.isEnabled = params.isEnabled;
    if (params.startDate) cleanParams.startDate = params.startDate;
    if (params.endDate) cleanParams.endDate = params.endDate;

    const response = await api.get<HotelRoom[]>('/common/hotel-rooms', { 
      params: cleanParams
    });
    return response.data;
  },

  async getRoomById(id: string): Promise<HotelRoom> {
    const response = await api.get<HotelRoom>(`/common/hotel-rooms/${id}`);
    return response.data;
  },

  async searchHotels(params: { limit: number; offset: number; title?: string }): Promise<Hotel[]> {
    const response = await api.get<Hotel[]>('/common/hotels', { 
      params: {
        ...params,
        limit: params.limit || 10,
        offset: params.offset || 0
      }
    });
    return response.data;
  },

  async getHotelById(id: string): Promise<Hotel> {
    const response = await api.get<Hotel>(`/common/hotels/${id}`);
    return response.data;
  },

  async createHotel(data: CreateHotelData): Promise<Hotel> {
    const response = await api.post<Hotel>('/admin/hotels', data);
    return response.data;
  },

  async updateHotel(id: string, data: UpdateHotelData): Promise<Hotel> {
    const response = await api.put<Hotel>(`/admin/hotels/${id}`, data);
    return response.data;
  }
};