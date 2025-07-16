import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from './entities/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CityEntity])
  ],
  controllers: [GeoController],
  providers: [GeoService]
})
export class GeoModule {}
