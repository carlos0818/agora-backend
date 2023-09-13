import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";
import { RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from "src/database/database.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly databaseService: DatabaseService,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<RowDataPacket> {
        const { email } = payload;

        const conn = await this.databaseService.getConnection();

        const user = await conn.query<RowDataPacket[]>(`
            SELECT status FROM ag_user WHERE email=?
            `, [email]
        );

        await this.databaseService.closeConnection(conn);

        if(user[0].length === 0) {
            throw new UnauthorizedException('Token not valid');
        }

        if(user[0][0].status === '0') {
            throw new UnauthorizedException('User is inactive, talk with an admin');
        }

        return user[0][0];
    }
}