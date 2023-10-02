import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async applySeeds(): Promise<any> {
    await this.appService.seed();
    return 'ok';
  }

  @Get(':id')
  async getEmployee(@Param('id') id: string) {
    return this.appService.getEmployeeById(+id);
  }
}
