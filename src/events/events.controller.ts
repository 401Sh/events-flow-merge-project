import { Controller, Post, UseGuards, Request, Patch, Delete, Get, Param, Body, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { EventOwnerGuard } from './guards/event-owner.guard';
import { CreateEventBodyDto } from './dto/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/update-event-body.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { EventDto } from './dto/event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Создать новое мероприятие',
  })
  @ApiBody({
    description: 'Данные создания мероприятия',
    type: CreateEventBodyDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Созданное мероприятие',
    type: EventDto,
  })
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Request() req,
    @Body() data: CreateEventBodyDto,
  ) {
    const userId = req.user['sub'];
    const result = await this.eventsService.create(userId, data);

    return result;
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Получить свое мероприятие',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id созданного мероприятия',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Найденное свое мероприятие',
    type: EventDto,
  })
  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Get(':eventId/self')
  async findMyEvent(
    @Param('eventId', ParseIntPipe) eventId: number
  ) {
    const result = await this.eventsService.findById(eventId);

    return result;
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Обновить свое мероприятие',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id своего мероприятия',
    example: 1,
  })
  @ApiBody({
    description: 'Данные для обновления мероприятия',
    type: UpdateEventBodyDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Обновленное мероприятие',
    type: EventDto,
  })
  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Patch(':eventId')
  async update(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() data: UpdateEventBodyDto,
  ) {
    const result = await this.eventsService.update(eventId, data);

    return result;
  }


  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Post(':eventId/poster')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    const fileUrl = await this.eventsService.updatePosterUrl(
      eventId,
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    return {
      message: 'Image uploaded successfully',
      fileName: file.originalname,
      url: fileUrl,
    };
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Удалить свое мероприятие',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id своего мероприятия',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Мероприятие успешно удалено',
  })
  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Delete(':eventId')
  async delete(
    @Param('eventId', ParseIntPipe) eventId: number
  ) {
    await this.eventsService.delete(eventId);

    return {
      message: 'Event deleted successfully'
    }
  }
}