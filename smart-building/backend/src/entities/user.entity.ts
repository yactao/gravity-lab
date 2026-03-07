import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ENERGY_MANAGER = 'ENERGY_MANAGER',
    CLIENT = 'CLIENT',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ default: 'password123' })
    password: string;

    @Column({
        type: 'varchar',
        default: UserRole.CLIENT,
    })
    role: UserRole;

    @ManyToOne(() => Organization, org => org.users, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    // Added to fix CustomRole relationship
    @ManyToOne('CustomRole', 'users', { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'customRoleId' })
    customRole: any; // Using any to avoid circular import if needed, or proper type

    @CreateDateColumn()
    createdAt: Date;
}
