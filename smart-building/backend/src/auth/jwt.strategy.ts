import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'SUPER_SECRET_KEY_V3',
        });
    }

    async validate(payload: any) {
        // This payload matches the one signed in auth.service.ts
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            organizationId: payload.organizationId,
            organizationName: payload.organizationName
        };
    }
}
