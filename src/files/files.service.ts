import { Injectable } from '@nestjs/common';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService
  ){}

  async uploadProfilePicture(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadProfilePicture(file);
      return result.secure_url;
    } catch (error) {
      console.log(error);
    }
  }
}
