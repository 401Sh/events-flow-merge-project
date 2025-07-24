import { dataSourceOptions } from "../configs/typeorm.config";
import { DataSource } from "typeorm";

const overrideOptions = {
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
};

export const dataSource = new DataSource({
  ...dataSourceOptions,
  ...overrideOptions,
});
