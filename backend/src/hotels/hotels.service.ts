import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import {
  IHotelService,
  SearchHotelParams,
  UpdateHotelParams,
} from './interfaces/hotel.interface';

@Injectable()
export class HotelsService implements IHotelService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>,
  ) {}

  async create(data: any): Promise<Hotel> {
    const hotel = await this.hotelModel.create(data);
    if (!hotel._id) throw new Error('Failed to create hotel');
    return hotel;
  }

  async findById(id: string): Promise<Hotel> {
    const hotel = await this.hotelModel.findById(id).exec();
    if (!hotel || !hotel._id) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const { limit, offset, title } = params;
    const filter = title ? { title: { $regex: title, $options: 'i' } } : {};

    const hotels = await this.hotelModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .exec();

    return hotels.filter((hotel) => hotel._id);
  }

  async update(id: string, data: UpdateHotelParams): Promise<Hotel> {
    const hotel = await this.hotelModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!hotel || !hotel._id) throw new NotFoundException('Hotel not found');
    return hotel;
  }
}
