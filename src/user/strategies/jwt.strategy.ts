import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectClient } from 'nest-mysql';
import { Connection, RowDataPacket } from 'mysql2/promise';

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectClient() private readonly connection: Connection,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<RowDataPacket> {
        const { email } = payload;
        const user = await this.connection.query<RowDataPacket[]>(`
            SELECT status FROM ag_user WHERE email=$1
            `, [email]
        );

        if(user[0].length > 0)
            throw new UnauthorizedException('Token not valid');

        if(user[0][0].status)
            throw new UnauthorizedException('User is inactive, talk with an admin');

        return user[0][0];
    }
}