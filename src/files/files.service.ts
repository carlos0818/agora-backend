import { Injectable } from '@nestjs/common';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ){}

  async uploadProfilePicture(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadProfilePicture(file);
      return result.eager[0].secure_url;
    } catch (error) {
      console.log(error);
    }
  }

  async uploadBackgroundPicture(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadBackgroundPicture(file);
      return result.eager[0].secure_url;
    } catch (error) {
      console.log(error);
    }
  }

  async uploadVideo(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadVideo(file);
      return result.secure_url;
    } catch (error) {
      console.log(error);
    }
  }
}
