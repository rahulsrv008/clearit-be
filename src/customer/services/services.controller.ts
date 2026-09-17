import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { CustomerAuth } from 'src/common/decorators/authorize.decorator';
import { CustomerServicesService } from './services.service';
import { ListCustomerServicesQueryDto } from './dto/list-services.dto';

@ApiTags('customer')
@CustomerAuth()
@Controller(ROUTES.CUSTOMER.SERVICES)
export class CustomerServicesController {
  constructor(private readonly servicesService: CustomerServicesService) {}

  // Declared before ':id' so the literal segment is not read as a param.
  @Get('categories')
  @ApiOperation({ summary: 'List active service categories' })
  categories() {
    return this.servicesService.categories();
  }

  @Get()
  @ApiOperation({
    summary: 'Browse active services with their effective price',
  })
  list(@Query() query: ListCustomerServicesQueryDto) {
    return this.servicesService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Service details with per-area pricing' })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.detail(id);
  }
}
