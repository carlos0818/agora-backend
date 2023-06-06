import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        mysql: {
            name: process.env.DATABASE_NAME,
            port: parseInt(process.env.DATABASE_PORT, 10),
            password: process.env.DATABASE_PASSWORD,
            user: process.env.DATABASE_USER,
            host: process.env.DATABASE_HOST,
        },
    }
});
