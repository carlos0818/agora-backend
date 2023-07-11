import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";
import { Pool, RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<RowDataPacket> {
        const { email } = payload;

        const user = await this.pool.query<RowDataPacket[]>(`
            SELECT status FROM ag_user WHERE email=?
            `, [email]
        );

        if(user[0].length === 0) {
            throw new UnauthorizedException('Token not valid');
        }

        if(user[0][0].status === '0') {
            throw new UnauthorizedException('User is inactive, talk with an admin');
        }

        return user[0][0];
    }
}