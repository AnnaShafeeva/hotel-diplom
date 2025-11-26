import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { SearchHotelParams } from './dto/search-hotel.params';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post('/api/admin/hotels')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateHotelDto) {
    const hotel = await this.hotelsService.create(dto);
    if (!hotel._id) throw new BadRequestException('Failed to create hotel');

    return {
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
    };
  }

  @Get('/api/admin/hotels')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() query: SearchHotelParams) {
    const hotels = await this.hotelsService.search(query);
    return hotels.map((hotel) => ({
      id: hotel._id!.toString(),
      title: hotel.title,
      description: hotel.description,
    }));
  }

  @Put('/api/admin/hotels/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateHotelDto) {
    const updateParams = {
      title: dto.title,
      description: dto.description,
    };

    const hotel = await this.hotelsService.update(id, updateParams);
    if (!hotel._id) throw new BadRequestException('Failed to update hotel');

    return {
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
    };
  }

  @Get('/api/common/hotels')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchPublic(@Query() query: SearchHotelParams) {
    const hotels = await this.hotelsService.search(query);
    return hotels.map((hotel) => ({
      id: hotel._id!.toString(),
      title: hotel.title,
      description: hotel.description,
    }));
  }

  @Get('/api/common/hotels/:id')
  async getPublic(@Param('id') id: string) {
    const hotel = await this.hotelsService.findById(id);
    return {
      id: hotel._id!.toString(),
      title: hotel.title,
      description: hotel.description,
    };
  }
}
