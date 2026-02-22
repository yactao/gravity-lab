import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity()
export class Rule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    building: string;

    @Column({ nullable: true })
    room: string;

    @Column()
    sensorType: string;

    @Column()
    conditionOperator: string; // '>', '<', '=', 'Oui', 'Non'

    @Column('float', { nullable: true })
    conditionValue: number;

    @Column()
    actionName: string;

    @Column()
    actionTarget: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column({ nullable: true })
    organizationId: string;
}
