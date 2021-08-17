import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt/jwt-auth.guard';
import { ProfileTypes } from '../profiles/model/profiles.enum';
import { DashboardService } from './dashboard.service';
import { DashboardDTO } from './dashboard.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard)
@Profiles(ProfileTypes.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getData(): Promise<DashboardDTO> {
    return this.dashboardService.getData();
  }
}
