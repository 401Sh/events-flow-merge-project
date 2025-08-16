import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('participations/:isCompleted')
  @UseGuards(AccessTokenGuard)
  async getLeaderUserEventsHistory(
    @Param('isCompleted', ParseBoolPipe) isCompleted: boolean,
    @Request() req,
  ) {
    const userId = req.user['sub'];

    return await this.usersService.getUserEventHistory(userId, isCompleted);
  }


  @Post('participations/:id')
  @UseGuards(AccessTokenGuard)
  async subscribeEvent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user['sub'];

    return await this.usersService.subscribeToEvent(userId, id);
  }


  @Delete('participations/:id')
  @UseGuards(AccessTokenGuard)
  async unsubscribeToEvent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user['sub'];

    await this.usersService.unsubscribeToEvent(userId, id);
  }
}