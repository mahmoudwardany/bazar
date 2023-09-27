/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../utils/common/logger.services';

@Injectable()
export class AuditService {
  private formattedTime: string;

  constructor(private readonly logger: LoggerService
    ) {
      const timestamp = Date.now();
      const date = new Date(timestamp);
      
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      this.formattedTime = `${day}/${date.getMonth() + 1}/${date.getFullYear()} ${hours}:${minutes}`;
    }

  logUserLogin(userId: number, ipAddress: string) {
    this.logger.log(`User ${userId} logged in from IP ${ipAddress} at ${this.formattedTime}`);
  } 
  failedLogUserLogin(userId: number, errorMessage: string, errorTrace: string) {
    this.logger.error(`User ${userId} failed to login: ${errorMessage} at ${this.formattedTime} `, errorTrace);
  }

  logOrderPlacement(userId: number, orderId: number) {
    this.logger.log(`User ${userId} placed an order (Order ID: ${orderId}) at ${this.formattedTime}`);
  }
  failedOrder(userId: number,orderId: number ,errorMessage: string, errorTrace: string) {
    this.logger.error(`User ${userId} failed to  order ${errorMessage} with  (Order ID: ${orderId}) at ${this.formattedTime} `, errorTrace);
  }
}
