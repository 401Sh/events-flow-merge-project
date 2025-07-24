import { dataSourceOptions } from "../configs/typeorm.config";
import { DataSource } from "typeorm";

export const dataSource = new DataSource(dataSourceOptions);