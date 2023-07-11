import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('user-profile')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter
  }))
  uploadProfilePicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    return this.filesService.uploadProfilePicture(file);
  }
}
