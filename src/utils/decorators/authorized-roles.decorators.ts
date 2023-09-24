/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

export const AuthorizedRoles = (...roles: string[]) => SetMetadata('allowedRoles', roles);