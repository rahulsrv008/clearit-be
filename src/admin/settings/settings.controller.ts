import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AdminSettingsService } from './settings.service';
import { UpdateAdminSettingDto } from './dto/update-setting.dto';
import { BulkUpdateAdminSettingsDto } from './dto/bulk-update-settings.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.SETTINGS)
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'All system settings' })
  list() {
    return this.settingsService.list();
  }

  @Patch()
  @ApiOperation({ summary: 'Bulk upsert settings in one call' })
  bulkUpdate(
    @CurrentUser('sub') adminId: string,
    @Body() dto: BulkUpdateAdminSettingsDto,
  ) {
    return this.settingsService.bulkSet(adminId, dto);
  }

  @Get(':key')
  @ApiOperation({ summary: 'One system setting' })
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Create or update one system setting' })
  set(
    @CurrentUser('sub') adminId: string,
    @Param('key') key: string,
    @Body() dto: UpdateAdminSettingDto,
  ) {
    return this.settingsService.set(adminId, key, dto);
  }
}
