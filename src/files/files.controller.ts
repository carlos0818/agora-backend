import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';
import { videoFilter } from './helpers/videoFilter';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  @Post('user-profile')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: { fileSize: 2048 * 1024 }
  }))
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    return this.filesService.uploadProfilePicture(file);
  }

  @Post('user-background')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: { fileSize: 2048 * 1024 }
  }))
  async uploadBackgroundPicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    return this.filesService.uploadBackgroundPicture(file);
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('video', {
    fileFilter: videoFilter,
    limits: { fileSize: 250 * 1024 * 1024 }
  }))
  async uploadVideo(@UploadedFile() video: Express.Multer.File) {
    if (!video) {
      throw new BadRequestException('Make sure that the file is a video');
    }

    return this.filesService.uploadVideo(video);
  }
}
