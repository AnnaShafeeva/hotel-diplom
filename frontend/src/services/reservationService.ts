import { api } from './api';
import { ReservationWithDetails } from '../types/reservation';

export const reservationService = {
  async getUserReservations(userId: string): Promise<ReservationWithDetails[]> {
    const response = await api.get<ReservationWithDetails[]>(`/manager/reservations/${userId}`);
    return response.data;
  },

  async cancelReservation(reservationId: string): Promise<void> {
    await api.delete(`/manager/reservations/${reservationId}`);
  },

  async getMyReservations(): Promise<ReservationWithDetails[]> {
    const response = await api.get<ReservationWithDetails[]>('/client/reservations');
    return response.data;
  },

  async createReservation(data: {
    hotelRoom: string;
    startDate: string;
    endDate: string;
  }): Promise<ReservationWithDetails> {
    const response = await api.post<ReservationWithDetails>('/client/reservations', data);
    return response.data;
  },

  async cancelMyReservation(reservationId: string): Promise<void> {
    await api.delete(`/client/reservations/${reservationId}`);
  },
};