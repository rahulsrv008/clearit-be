import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../types/auth.types';

function authorize(...roles: UserRole[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }),
    ApiForbiddenResponse({ description: 'Account blocked or wrong role' }),
  );
}

/** Customer-app endpoints. */
export const CustomerAuth = () => authorize('customer');

/** Agent-app endpoints. */
export const AgentAuth = () => authorize('agent');

/** Admin-web endpoints. */
export const AdminAuth = () => authorize('admin');
