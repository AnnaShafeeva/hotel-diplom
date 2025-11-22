import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { HotelsModule } from '../hotels/hotels.module';
import {
  HotelRoom,
  HotelRoomSchema,
} from 'src/hotels/schemas/hotel-room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
    HotelsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
