import { Organization } from './organization.entity';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ENERGY_MANAGER = "ENERGY_MANAGER",
    CLIENT = "CLIENT"
}
export declare class User {
    id: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    organization: Organization;
    createdAt: Date;
}
