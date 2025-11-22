import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './schemas/hotel-room.schema';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import {
  IHotelRoomService,
  SearchRoomsParams,
} from './interfaces/hotel-room.interface';

@Injectable()
export class HotelRoomsService implements IHotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly hotelRoomModel: Model<HotelRoomDocument>,
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<HotelDocument>,
  ) {}

  async create(data: any): Promise<HotelRoom> {
    console.log('CREATE ROOM - INPUT DATA:', data);

    try {
      const hotelExists = await this.hotelModel.findById(data.hotelId);
      if (!hotelExists) {
        throw new NotFoundException(`Hotel with id ${data.hotelId} not found`);
      }

      const roomData = {
        description: data.description,
        hotel: new Types.ObjectId(data.hotelId),
        images: data.images || [],
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      };

      console.log('ROOM DATA FOR CREATION:', roomData);
      console.log('Hotel ObjectId:', roomData.hotel);
      console.log('Hotel ObjectId string:', roomData.hotel.toString());

      const room = await this.hotelRoomModel.create(roomData);
      console.log('ROOM CREATED SUCCESSFULLY:', room);

      return room;
    } catch (error) {
      console.error('CREATE ROOM ERROR:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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

    const { limit, offset, hotel, isEnabled } = params;

    const filter: any = {
      hotel: new Types.ObjectId(hotel),
    };

    console.log('FILTER WITH ObjectId:', filter);

    if (!userRole || userRole === 'client') {
      filter.isEnabled = true;
      console.log('Applied isEnabled=true filter for public access');
    } else if (isEnabled !== undefined) {
      filter.isEnabled = isEnabled;
      console.log('Applied isEnabled filter:', isEnabled);
    }

    console.log('FINAL FILTER:', filter);

    const rooms = await this.hotelRoomModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .populate('hotel')
      .exec();

    console.log('FOUND ROOMS COUNT:', rooms.length);

    return rooms.filter((room) => room._id != null);
  }

  async update(id: string, data: any): Promise<HotelRoom> {
    const updateData: any = { ...data };

    if (data.hotelId) {
      updateData.hotel = new Types.ObjectId(data.hotelId);
      delete updateData.hotelId;
    }

    const room = await this.hotelRoomModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('hotel')
      .exec();

    if (!room || !room._id) throw new NotFoundException('Room not found');
    return room;
  }
}
