/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../utils/common/logger.services';

@Injectable()
export class AuditService {
  constructor(private readonly logger: LoggerService) {}

  logUserLogin(userId: number, ipAddress: string) {
    this.logger.log(`User ${userId} logged in from IP ${ipAddress}`);
  }

  logOrderPlacement(userId: number, orderId: number) {
    this.logger.log(`User ${userId} placed an order (Order ID: ${orderId})`);
  }
}
