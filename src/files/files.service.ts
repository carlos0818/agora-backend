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
      console.log(result);
      return result.eager[0].secure_url;
    } catch (error) {
      console.log(error);
    }
  }
}
