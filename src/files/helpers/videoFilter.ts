import { Request } from 'express';

export const videoFilter = (req: Request, video: Express.Multer.File, callback: Function) => {
    if (!video)
        return callback(new Error('File is empty'), false);

    const fileExtension = video.mimetype.split('/')[1];
    const validExtensions = ['mp4'];

    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    }
    
    callback(null, false);
}