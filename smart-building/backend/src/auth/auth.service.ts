import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['organization'] // Important to get the right Organization
        });

        // For MVP: Plain text password comparison (In Production: use bcrypt.compare)
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // Payload defined for JWT
        const payload = {
            sub: user.id, // Subject = User ID
            email: user.email,
            role: user.role,
            organizationId: user.organization?.id || null, // null for SUPER_ADMIN usually
            organizationName: user.organization?.name || 'Global',
            firstName: user.firstName,
            lastName: user.lastName
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: payload // Return basic user info to hydrate frontend context
        };
    }
}
