import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('/api/client/reservations')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: CreateReservationDto, @Req() req: any) {
    // const userId = req.user?.id || 'temp-user-id';
    const userId = '691b18ea2dd236656e2dd459';
    const room = await this.reservationsService.getRoomById(dto.hotelRoom);
    const hotelId = (room.hotel as any)._id.toString();

    const reservation = await this.reservationsService.addReservation({
      userId,
      hotelId,
      roomId: dto.hotelRoom,
      dateStart: new Date(dto.startDate),
      dateEnd: new Date(dto.endDate),
    });

    const populatedReservation =
      await this.reservationsService.getReservationWithDetails(
        reservation._id!.toString(),
      );

    return {
      startDate: populatedReservation.dateStart.toISOString(),
      endDate: populatedReservation.dateEnd.toISOString(),
      hotelRoom: {
        description: (populatedReservation.roomId as any).description,
        images: (populatedReservation.roomId as any).images,
      },
      hotel: {
        title: (populatedReservation.hotelId as any).title,
        description: (populatedReservation.hotelId as any).description,
      },
    };
  }

  @Get('/api/client/reservations')
  async getUserReservations(@Req() req: any) {
    const userId = req.user?.id || 'temp-user-id';

    const reservations = await this.reservationsService.getReservations({
      userId,
    });

    return reservations.map((reservation) => ({
      startDate: reservation.dateStart.toISOString(),
      endDate: reservation.dateEnd.toISOString(),
      hotelRoom: {
        description: (reservation.roomId as any).description,
        images: (reservation.roomId as any).images,
      },
      hotel: {
        title: (reservation.hotelId as any).title,
        description: (reservation.hotelId as any).description,
      },
    }));
  }

  @Delete('/api/client/reservations/:id')
  async cancelReservation(@Param('id') id: string, @Req() req: any) {
    await this.reservationsService.removeReservation(id);
    return {};
  }

  @Get('/api/manager/reservations/:userId')
  async getUserReservationsManager(@Param('userId') userId: string) {
    const reservations = await this.reservationsService.getReservations({
      userId,
    });

    return reservations.map((reservation) => ({
      startDate: reservation.dateStart.toISOString(),
      endDate: reservation.dateEnd.toISOString(),
      hotelRoom: {
        description: (reservation.roomId as any).description,
        images: (reservation.roomId as any).images,
      },
      hotel: {
        title: (reservation.hotelId as any).title,
        description: (reservation.hotelId as any).description,
      },
    }));
  }

  @Delete('/api/manager/reservations/:id')
  async cancelReservationManager(@Param('id') id: string) {
    await this.reservationsService.removeReservation(id);
    return {};
  }
}
