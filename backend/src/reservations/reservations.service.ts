import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import {
  IReservationService,
  ReservationDto,
  ReservationSearchOptions,
} from './interfaces/reservation.interface';
import {
  HotelRoom,
  HotelRoomDocument,
} from '../hotels/schemas/hotel-room.schema';

@Injectable()
export class ReservationsService implements IReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(HotelRoom.name)
    private readonly hotelRoomModel: Model<HotelRoomDocument>,
  ) {}

  async getRoomById(roomId: string): Promise<HotelRoom> {
    const room = await this.hotelRoomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async addReservation(data: ReservationDto): Promise<Reservation> {
    const isAvailable = await this.isRoomAvailable(
      data.roomId,
      data.dateStart,
      data.dateEnd,
    );
    if (!isAvailable) {
      throw new BadRequestException(
        'Room is not available for the selected dates',
      );
    }

    const room = await this.hotelRoomModel.findById(data.roomId);
    if (!room || !room.isEnabled) {
      throw new BadRequestException('Room not found or disabled');
    }

    const reservation = await this.reservationModel.create({
      userId: new Types.ObjectId(data.userId),
      hotelId: new Types.ObjectId(data.hotelId),
      roomId: new Types.ObjectId(data.roomId),
      dateStart: data.dateStart,
      dateEnd: data.dateEnd,
    });

    return reservation;
  }

  async removeReservation(id: string): Promise<void> {
    const result = await this.reservationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Reservation not found');
    }
  }

  async getReservations(
    filter: ReservationSearchOptions,
  ): Promise<Reservation[]> {
    console.log('GET RESERVATIONS - FILTER:', filter);

    const query: any = {};

    if (filter.userId) {
      try {
        if (Types.ObjectId.isValid(filter.userId)) {
          query.userId = new Types.ObjectId(filter.userId);
          console.log('VALID USER ID FILTER:', query.userId);
        } else {
          console.log('INVALID USER ID, SKIPPING FILTER:', filter.userId);
        }
      } catch (error) {
        console.log('USER ID FILTER ERROR:', error);
      }
    }

    console.log('FINAL QUERY:', query);

    try {
      const reservations = await this.reservationModel
        .find(query)
        .populate('hotelId')
        .populate('roomId')
        .exec();

      console.log('FOUND RESERVATIONS COUNT:', reservations.length);

      return reservations;
    } catch (error) {
      console.error('GET RESERVATIONS ERROR:', error);
      throw error;
    }
  }

  async getReservationWithDetails(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('hotelId')
      .populate('roomId')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }
  private async isRoomAvailable(
    roomId: string,
    dateStart: Date,
    dateEnd: Date,
  ): Promise<boolean> {
    const overlappingReservations = await this.reservationModel
      .find({
        roomId: new Types.ObjectId(roomId),
        $or: [
          {
            dateStart: { $lte: dateEnd },
            dateEnd: { $gte: dateStart },
          },
        ],
      })
      .exec();

    return overlappingReservations.length === 0;
  }
}
