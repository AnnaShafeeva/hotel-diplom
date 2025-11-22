import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { HotelRoomsService } from './hotel-rooms.service';
import { SearchRoomsParams } from './dto/search-rooms.params';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';

@Controller()
export class HotelRoomsController {
  constructor(private readonly hotelRoomsService: HotelRoomsService) {}

  @Get('/api/common/hotel-rooms')
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() query: SearchRoomsParams, @Req() req: any) {
    const userRole = req.user?.role || null;

    const rooms = await this.hotelRoomsService.search(query, userRole);

    return rooms.map((room) => ({
      id: room._id!.toString(),
      description: room.description,
      images: room.images,
      hotel: {
        id: (room.hotel as any)._id.toString(),
        title: (room.hotel as any).title,
      },
    }));
  }

  @Get('/api/common/hotel-rooms/:id')
  async get(@Param('id') id: string) {
    const room = await this.hotelRoomsService.findById(id);

    if (!room._id) {
      throw new BadRequestException('Room ID is undefined');
    }

    return {
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      hotel: {
        id: (room.hotel as any)._id.toString(),
        title: (room.hotel as any).title,
        description: (room.hotel as any).description,
      },
    };
  }

  @Post('/api/admin/hotel-rooms')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateHotelRoomDto) {
    const room = await this.hotelRoomsService.create(dto);
    if (!room._id) throw new BadRequestException('Failed to create room');

    return {
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      isEnabled: room.isEnabled,
      hotel: {
        id: (room.hotel as any)._id.toString(),
        title: (room.hotel as any).title,
        description: (room.hotel as any).description,
      },
    };
  }

  @Put('/api/admin/hotel-rooms/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateHotelRoomDto) {
    const room = await this.hotelRoomsService.update(id, dto);
    if (!room._id) throw new BadRequestException('Failed to update room');

    return {
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      isEnabled: room.isEnabled,
      hotel: {
        id: (room.hotel as any)._id.toString(),
        title: (room.hotel as any).title,
        description: (room.hotel as any).description,
      },
    };
  }
}
