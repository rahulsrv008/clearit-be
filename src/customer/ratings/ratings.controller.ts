import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { CustomerAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { CustomerRatingsService } from './ratings.service';
import { CreateCustomerRatingDto } from './dto/create-rating.dto';

@ApiTags('customer')
@CustomerAuth()
@Controller(ROUTES.CUSTOMER.RATINGS)
export class CustomerRatingsController {
  constructor(private readonly ratingsService: CustomerRatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Rate the agent of a completed booking' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCustomerRatingDto,
  ) {
    return this.ratingsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Ratings the customer has submitted' })
  list(@CurrentUser('sub') userId: string, @Query() query: PaginationQueryDto) {
    return this.ratingsService.list(userId, query);
  }
}
