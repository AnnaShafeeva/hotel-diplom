import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelsService } from './hotels.service';
import { HotelRoomsService } from './hotel-rooms.service';
import { HotelsController } from './hotels.controller';
import { HotelRoomsController } from './hotel-rooms.controller';
import { Hotel, HotelSchema } from './schemas/hotel.schema';
import { HotelRoom, HotelRoomSchema } from './schemas/hotel-room.schema';
import { FileUploadService } from './file-upload.service';
import {
  Reservation,
  ReservationSchema,
} from '../reservations/schemas/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [HotelsController, HotelRoomsController],
  providers: [HotelsService, HotelRoomsService, FileUploadService],
  exports: [HotelsService, HotelRoomsService, FileUploadService],
})
export class HotelsModule {}
