import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export interface ProcessedImage {
  preview: string;
  main: string;
}

@Injectable()
export class FileUploadService {
  private readonly uploadPath = './uploads/hotel-rooms';

  constructor() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  getMulterConfig() {
    return {
      storage: diskStorage({
        destination: this.uploadPath,
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
    };
  }

  async validateAndProcessImage(filePath: string): Promise<ProcessedImage> {
    console.log('File path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    console.log('File size:', fs.statSync(filePath).size);

    const fileBuffer = fs.readFileSync(filePath);
    console.log('File buffer length:', fileBuffer.length);
    console.log('First 100 bytes:', fileBuffer.slice(0, 100).toString('hex'));
    const sharp = require('sharp');

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      if (metadata.width < 1000) {
        fs.unlinkSync(filePath);
        throw new BadRequestException('Минимальная ширина изображения 1000px');
      }

      if (Math.max(metadata.width, metadata.height) > 5000) {
        fs.unlinkSync(filePath);
        throw new BadRequestException(
          'Максимальный размер изображения 5000px по любой стороне',
        );
      }

      const previewPath = filePath.replace(/(\.\w+)$/, '-preview$1');
      const mainPath = filePath.replace(/(\.\w+)$/, '-main$1');

      await image
        .clone()
        .resize(300, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toFile(previewPath);

      await image
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(mainPath);

      fs.unlinkSync(filePath);

      return {
        preview: previewPath.replace(/^\.\/uploads/, '/uploads'),
        main: mainPath.replace(/^\.\/uploads/, '/uploads'),
      };
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  async processUploadedFiles(
    files: Express.Multer.File[],
  ): Promise<ProcessedImage[]> {
    if (files && files.length > 10) {
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      throw new BadRequestException('Максимум 10 изображений');
    }

    const processedImages: ProcessedImage[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const processedImage = await this.validateAndProcessImage(file.path);
          processedImages.push(processedImage);
        } catch (error) {
          processedImages.forEach((image) => {
            [image.preview, image.main].forEach((imagePath) => {
              const fullPath = './uploads' + imagePath;
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            });
          });
          throw error;
        }
      }
    }

    return processedImages;
  }
}
