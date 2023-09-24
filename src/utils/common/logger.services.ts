/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService extends Logger {
    private logger: winston.Logger;

constructor() {
    super();
    this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
    });
    }

    log(message: string) {
        super.log(message);
        this.logger.log('info', message);
    }
    error(message: string, trace: string) {
        super.error(message, trace);
        this.logger.log('error', message, { trace });
    }
}
