import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { CoordinatesDto } from './dto/coordinates.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';

@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @Get()
  async getCityList(
    @Query() query: GetCitiesQueryDto,
  ) {
    return await this.geoService.getCityList(query); 
  }

  @Get(':cityId/nearest')
  async getNearestCities(
    @Param('cityId', ParseIntPipe) cityId: number,
  ) {
    return await this.geoService.findNearestCities(cityId);
  }

  @Post('coords')
  async getCityByCoords(@Body() coords: CoordinatesDto) {
    return await this.geoService.findCityByCoords(coords);
  }
}
