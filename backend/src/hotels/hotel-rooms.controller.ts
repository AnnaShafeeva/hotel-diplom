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
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { HotelRoomsService } from './hotel-rooms.service';
import { SearchRoomsParams } from './dto/search-rooms.params';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileUploadService, ProcessedImage } from './file-upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller()
export class HotelRoomsController {
  constructor(
    private readonly hotelRoomsService: HotelRoomsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('/api/common/hotel-rooms')
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() query: SearchRoomsParams, @Req() req: any) {
    const userRole = req.user?.role;

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
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/hotel-rooms',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `hotel-room-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException(
              'Разрешены только изображения jpg, jpeg, png, webp',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Body() dto: CreateHotelRoomDto,
  ) {
    let processedImages: ProcessedImage[] = [];

    try {
      if (files && files.length > 0) {
        processedImages =
          await this.fileUploadService.processUploadedFiles(files);
      }

      const room = await this.hotelRoomsService.create({
        ...dto,
        images: processedImages,
      });

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
    } catch (error) {
      processedImages.forEach((image) => {
        [image.preview, image.main].forEach((imagePath) => {
          const fullPath = './uploads' + imagePath;
          if (require('fs').existsSync(fullPath)) {
            require('fs').unlinkSync(fullPath);
          }
        });
      });
      throw error;
    }
  }

  @Put('/api/admin/hotel-rooms/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/hotel-rooms',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `hotel-room-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException(
              'Разрешены только изображения jpg, jpeg, png, webp',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Body() dto: UpdateHotelRoomDto,
  ) {
    let processedImages: ProcessedImage[] = [];

    try {
      if (files && files.length > 0) {
        processedImages =
          await this.fileUploadService.processUploadedFiles(files);
      }

      const existingRoom = await this.hotelRoomsService.findById(id);
      const existingImages = existingRoom.images || [];

      const allImages = [
        ...existingImages.filter((img) => typeof img === 'string'),
        ...processedImages.map((img) => img.main),
      ];

      const room = await this.hotelRoomsService.update(id, {
        ...dto,
        images: allImages,
      });

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
    } catch (error) {
      processedImages.forEach((image) => {
        [image.preview, image.main].forEach((imagePath) => {
          const fullPath = './uploads' + imagePath;
          if (require('fs').existsSync(fullPath)) {
            require('fs').unlinkSync(fullPath);
          }
        });
      });
      throw error;
    }
  }
}
