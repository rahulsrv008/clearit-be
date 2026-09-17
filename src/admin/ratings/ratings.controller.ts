import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AdminRatingsService } from './ratings.service';
import { ListAdminRatingsDto } from './dto/list-ratings.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.RATINGS)
export class AdminRatingsController {
  constructor(private readonly ratingsService: AdminRatingsService) {}

  @Get()
  @ApiOperation({ summary: 'List ratings with a star breakdown summary' })
  list(@Query() query: ListAdminRatingsDto) {
    return this.ratingsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Rating detail with its reviews' })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.ratingsService.detail(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Moderation: delete a rating and its reviews' })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ratingsService.remove(adminId, id);
  }
}
