import { Reservation } from '../schemas/reservation.schema';
import { ID } from '../../users/interfaces/user.interface';

export interface ReservationDto {
  userId: ID;
  hotelId: ID;
  roomId: ID;
  dateStart: Date;
  dateEnd: Date;
}

export interface ReservationSearchOptions {
  userId?: ID;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface IReservationService {
  addReservation(data: ReservationDto): Promise<Reservation>;
  removeReservation(id: ID): Promise<void>;
  getReservations(filter: ReservationSearchOptions): Promise<Reservation[]>;
  getRoomById(roomId: string): Promise<any>;
  getReservationWithDetails(id: string): Promise<Reservation>;
}
