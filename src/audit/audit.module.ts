/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuditService } from './audit.services';
import { LoggerService } from 'src/utils/common/logger.services';

@Module({
  providers: [AuditService,LoggerService],
  exports:[AuditService,LoggerService]
})
export class AuditModule {}
