import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MysqlModule } from 'nest-mysql';
import { createConnection } from 'mysql2/promise';

import config from '../config';

@Global()
@Module({
    // imports: [
    //     MysqlModule.forRootAsync({
    //         inject: [config.KEY],
    //         useFactory: (configService: ConfigType<typeof config>) => {
    //             const { user, host, name, password, port } = configService.mysql;
                
    //             return {
    //                 host,
    //                 database: name,
    //                 user,
    //                 password,
    //                 port,
    //             };
    //         },
    //     }, 'MySQL'),
    // ],

    providers: [
        {
            provide: 'DATABASE_CONNECTION',
            useFactory: async () => {
                return await createConnection({
                    port: parseInt(process.env.DATABASE_PORT, 10),
                    host: process.env.DATABASE_HOST,
                    user: process.env.DATABASE_USER,
                    password: process.env.DATABASE_PASSWORD,
                    database: process.env.DATABASE_NAME,
                    connectionLimit: 1,
                });
            },
        },
    ],
    exports: ['DATABASE_CONNECTION'],
})

export class DatabaseModule {}
