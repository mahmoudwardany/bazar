/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { UserService } from '../../users/services/users.service';
import { UserEntity } from 'src/users/entities/user.entity';

declare module 'express' {
  interface Request {
    user?: UserEntity;
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService ,private userService:UserService) {} 

 async use(req: Request, res: Response, next: NextFunction) {
    const secretKey = this.configService.get<string>('JWT_SECRET')
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
      res.status(401).json({ message: 'no token' });
      req.user=null
      next();
    } else {
      try {
        const token = authHeaders.split(' ')[1];
      const { id } =<JwtInterface> verify(token, secretKey);
      const currentUser = await this.userService.findUserById(id)
      req.user=currentUser
      next();
      } catch (error) {
        req.user=null
        next();
      }
    }
  }
}
interface JwtInterface {
  id:string
}

