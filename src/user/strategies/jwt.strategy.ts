import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";
import { Client } from "pg";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('Postgres') private clientPg: Client,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { email } = payload;
        const user = await this.clientPg.query<User>(`
            SELECT status FROM ag_user WHERE email=$1
            `, [email]
        );

        console.log(user.rows[0])

        if(user.rows.length > 0)
            throw new UnauthorizedException('Token not valid');

        if(user.rows[0].status)
            throw new UnauthorizedException('User is inactive, talk with an admin');

        return user.rows[0];
    }
}