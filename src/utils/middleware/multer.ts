/* eslint-disable prettier/prettier */
import { MulterModuleOptions } from '@nestjs/platform-express';
import { Request } from 'express';

export const multerConfig: MulterModuleOptions = {
  dest: '../../images', 
  storage: undefined, 
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jfif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid Image Type'), false);

    }
  },
};
