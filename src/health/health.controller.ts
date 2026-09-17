import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { ROUTES } from 'src/app.routes';

@ApiTags('health')
@Controller(ROUTES.HEALTH)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness + database connectivity' })
  health() {
    return this.healthService.getHealthStatus();
  }
}
