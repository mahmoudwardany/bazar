/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmCOnfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'database',
    database: 'bazara',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
};