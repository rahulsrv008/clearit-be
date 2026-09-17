import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/auth.types';

export const ROLES_KEY = 'clearit:roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
