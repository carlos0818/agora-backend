import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from 'pg';

import config from '../config';

@Global()
@Module({
    providers: [
        {
            provide: 'Postgres',
            inject: [config.KEY],
            useFactory: (configService: ConfigType<typeof config>) => {
                const { user, host, name, password, port } = configService.postgres;
                const client = new Client({
                    host,
                    database: name,
                    user,
                    password,
                    port,
                });
                client.connect();
                return client;
            },
        },
    ],
    exports: ['Postgres']
})
export class DatabaseModule {}
