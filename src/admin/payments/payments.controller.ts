import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { AdminPaymentsService } from './payments.service';
import { ListAdminPaymentsDto } from './dto/list-payments.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.PAYMENTS)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: AdminPaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List payments with collected/pending/refunded totals',
  })
  list(@Query() query: ListAdminPaymentsDto) {
    return this.paymentsService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Payment detail with booking, customer and gateway transactions',
  })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.detail(id);
  }
}
