import {
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { EventOwnerGuard } from './guards/event-owner.guard';
import { CreateEventBodyDto } from './dto/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/update-event-body.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { EventDto } from './dto/event.dto';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { EventsListResultDto } from './dto/event-list-result.dto';

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
    status: HttpStatus.OK,
    description: 'Созданное мероприятие',
    type: EventDto,
  })
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Request() req, @Body() data: CreateEventBodyDto) {
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
    status: HttpStatus.OK,
    description: 'Найденное свое мероприятие',
    type: EventDto,
  })
  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Get(':eventId/self')
  async findMyEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    const result = await this.eventsService.findById(eventId);

    return result;
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Получить свои созданные мероприятия',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество мероприятий на странице',
    example: 10,
    default: 4,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 2,
    default: 1,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию',
    example: 'ФОТО экскурсия',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Фильтрация мероприятий позднее указанной даты',
    example: '2020-12-30',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Фильтрация мероприятий раньше указанной даты',
    example: '2020-12-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Найденные свои мероприятия',
    type: EventsListResultDto,
  })
  @UseGuards(AccessTokenGuard)
  @Get(':eventId/self')
  async findAllMyEvents(@Query() query: GetEventListQueryDto, @Request() req) {
    const userId = req.user['sub'];

    const result = await this.eventsService.findMy(userId, query);

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
    status: HttpStatus.OK,
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


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Загрузка постера для мероприятия',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id своего мероприятия',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Постер успешно загружен',
  })
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
    status: HttpStatus.OK,
    description: 'Мероприятие успешно удалено',
  })
  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Delete(':eventId')
  async delete(@Param('eventId', ParseIntPipe) eventId: number) {
    await this.eventsService.delete(eventId);

    return {
      message: 'Event deleted successfully',
    };
  }
}