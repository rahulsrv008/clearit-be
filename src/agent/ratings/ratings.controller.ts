import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AgentAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { AgentRatingsService } from './ratings.service';

@ApiTags('agent')
@AgentAuth()
@Controller(ROUTES.AGENT.RATINGS)
export class AgentRatingsController {
  constructor(private readonly ratingsService: AgentRatingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Rating average, star breakdown and recent reviews',
  })
  summary(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.ratingsService.summary(userId, query);
  }
}
