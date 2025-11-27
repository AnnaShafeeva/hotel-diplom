import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './schemas/hotel-room.schema';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import {
  IHotelRoomService,
  SearchRoomsParams,
} from './interfaces/hotel-room.interface';
import { ProcessedImage } from './file-upload.service';
import {
  Reservation,
  ReservationDocument,
} from '../reservations/schemas/reservation.schema';

@Injectable()
export class HotelRoomsService implements IHotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly hotelRoomModel: Model<HotelRoomDocument>,
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<HotelDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async create(data: any): Promise<HotelRoom> {
    console.log('CREATE ROOM - INPUT DATA:', data);

    try {
      const hotelExists = await this.hotelModel.findById(data.hotelId);
      if (!hotelExists) {
        throw new NotFoundException(`Hotel with id ${data.hotelId} not found`);
      }

      const imageUrls = data.images
        ? data.images.map((img: ProcessedImage) =>
            img.main.replace(/^\.\/uploads/, '/uploads'),
          )
        : [];

      const roomData = {
        description: data.description,
        hotel: new Types.ObjectId(data.hotelId),
        images: imageUrls,
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      };

      console.log('ROOM DATA FOR CREATION:', roomData);

      const room = await this.hotelRoomModel.create(roomData);
      console.log('ROOM CREATED SUCCESSFULLY:', room);

      return room;
    } catch (error) {
      console.error('CREATE ROOM ERROR:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<HotelRoom> {
    const room = await this.hotelRoomModel
      .findById(id)
      .populate('hotel')
      .exec();

    if (!room || !room._id) throw new NotFoundException('Room not found');
    return room;
  }

  async search(
    params: SearchRoomsParams,
    userRole?: string,
  ): Promise<HotelRoom[]> {
    console.log('SEARCH PARAMS:', params);

    const { limit, offset, hotel, isEnabled, startDate, endDate } = params;

    const filter: any = {};

    if (hotel) {
      filter.hotel = new Types.ObjectId(hotel);
    }

    if (!userRole || userRole === 'client') {
      filter.isEnabled = true;
    } else if (isEnabled !== undefined) {
      filter.isEnabled = isEnabled;
    }

    const rooms = await this.hotelRoomModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .populate('hotel')
      .exec();

    console.log('FOUND ROOMS COUNT:', rooms.length);
    if (startDate && endDate) {
      console.log('Date filter applied:', { startDate, endDate });

      const availableRooms: HotelRoomDocument[] = [];
      const searchStartDate = new Date(startDate);
      const searchEndDate = new Date(endDate);

      for (const room of rooms) {
        const isAvailable = await this.isRoomAvailable(
          room._id.toString(),
          searchStartDate,
          searchEndDate,
        );

        if (isAvailable) {
          availableRooms.push(room);
        }
      }

      console.log(
        `✅ After filtering: ${availableRooms.length} available rooms`,
      );
      return availableRooms as HotelRoom[];
    }

    return rooms.filter((room) => room._id != null);
  }

  async update(id: string, data: any): Promise<HotelRoom> {
    const updateData: any = { ...data };

    if (data.hotelId) {
      updateData.hotel = new Types.ObjectId(data.hotelId);
      delete updateData.hotelId;
    }

    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map((img: any) =>
        typeof img === 'string' ? img : img.main,
      );
    }

    const room = await this.hotelRoomModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('hotel')
      .exec();

    if (!room || !room._id) throw new NotFoundException('Room not found');
    return room;
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
