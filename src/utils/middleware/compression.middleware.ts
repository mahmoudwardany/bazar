/* eslint-disable prettier/prettier */

import { Injectable, NestMiddleware } from '@nestjs/common';
import * as compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        compression({
            level: 6, 
            filter: (req:Request, res:Response) => {
        if (req.headers['x-no-compression']) {
            return false; 
        }
        return compression.filter(req, res);
        },
    })(req, res, next);
    }
}