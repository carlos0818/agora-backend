import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadProfilePicture(
    file: Express.Multer.File,
  ): Promise<UploadApiErrorResponse | UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          eager_async: true,
          eager: [
            { width: 300, height: 300, crop: 'fill' }
          ]
        }, (error, result) => {
        if (error) return reject(error);
        // const url = this.cropProfilePicture(result);
        console.log(result);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  // async uploadProfilePicture(
  //   file: Express.Multer.File,
  // ) {
  //     console.log('FILE:', file);
  //     v2.uploader.upload(file.originalname, { width: 300, height: 300, crop: 'fill' })
  //       .then(result => {
  //         console.log(result);
  //       })
  //       .catch(error => {
  //         console.log(error);
  //       });
  //     // console.log('UPLOAD:', upload);
  //     // toStream(file.buffer).pipe(upload);
  // }

  async cropProfilePicture(urlString: string) {
    // console.log('ORIGINAL:', original_filename);
    // console.log('SECURE_URL:', secure_url);

    const urlSplit = urlString.split('/');
    const filename = urlSplit[urlSplit.length - 1];

    const url = v2.image(filename, { width: 300, height: 300, crop: 'fill' });

    console.log('URL:', url);

    return url;
  }
}