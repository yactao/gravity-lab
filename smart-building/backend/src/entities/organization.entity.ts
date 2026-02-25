import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Site } from './site.entity';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // Raison sociale

    @Column({ nullable: true })
    type: string; // e.g. 'retail', 'hospitality', 'corporate'

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    region: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    establishmentDate: string; // jj/mm/aaaa

    @Column({ nullable: true })
    legalForm: string; // SARL, SAS, SA, etc.

    // --- Subscription & Quotas ---
    @Column({ default: 'Enterprise' })
    subscriptionPlan: string;

    @Column({ type: 'int', default: 5 })
    maxUsers: number;

    @Column({ type: 'int', default: 100 })
    maxDevices: number;

    @Column({ type: 'int', default: 5 })
    maxSites: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => User, user => user.organization)
    users: User[];

    @OneToMany(() => Site, site => site.organization)
    sites: Site[];
}
