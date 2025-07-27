import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({
    summary: 'Проверить работу сервера',
  })
  @ApiResponse({
    status: 200,
    description: 'API работает'
  })
  @Get('ping')
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
