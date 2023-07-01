import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MysqlModule } from 'nest-mysql';

import config from '../config';

@Global()
@Module({
    imports: [
        MysqlModule.forRootAsync({
            inject: [config.KEY],
            useFactory: (configService: ConfigType<typeof config>) => {
                const { user, host, name, password, port } = configService.mysql;
                
                return {
                    host,
                    database: name,
                    user,
                    password,
                    port,
                };
            },
        }, 'MySQL'),
    ],
})
export class DatabaseModule {}
