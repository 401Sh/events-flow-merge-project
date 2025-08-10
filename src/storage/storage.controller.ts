import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.storageService.uploadEventPoster(
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    return {
      message: 'Image uploaded successfully',
      fileName: file.originalname,
      url: fileUrl,
    };
  }
}