import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import { CoordinatesDto } from './dto/coordinates.dto';
import { GetNearestCitiesQueryDto } from './dto/get-nearest-cities-query.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CititesListResultDto } from './dto/cities-list-result.dto';
import { CititesListResultWithMetaDto } from './dto/cities-list-result-with-meta.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';
import { CityDto } from './dto/city.dto';

@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @ApiOperation({
    summary: 'Получить список городов',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество городов на странице',
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
    example: 'Омск',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список городов с пагинацией',
    type: CititesListResultWithMetaDto,
  })
  @Get()
  async getCityList(@Query() query: GetCitiesQueryDto) {
    return await this.geoService.findCityList(query);
  }


  @ApiOperation({
    summary: 'Получить список ближайших городов к городу с указанным id',
  })
  @ApiParam({
    name: 'cityId',
    required: true,
    description: 'Id города',
    example: '12',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество городов',
    example: 12,
    default: 5,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список ближайших городов',
    type: CititesListResultDto,
  })
  @Get(':cityId/nearest')
  async getNearestCities(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Query() query: GetNearestCitiesQueryDto,
  ) {
    return await this.geoService.findNearestCities(cityId, query);
  }


  @ApiOperation({
    summary: 'Получить id ближайшего города по координатам',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список ближайших городов',
    type: CityDto,
  })
  @ApiBody({
    description: 'Широта и долгота в формате geojson',
    type: CoordinatesDto,
    required: true,
  })
  @Post('coords')
  async getCityByCoords(@Body() coords: CoordinatesDto) {
    return await this.geoService.findCityByCoords(coords);
  }
}