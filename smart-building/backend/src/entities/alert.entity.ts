import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity()
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    message: string;

    @Column()
    severity: string; // 'INFO', 'WARNING', 'CRITICAL'

    @Index()
    @Column({ type: 'datetime' })
    timestamp: Date;

    @Column({ default: true })
    active: boolean; // True until acknowledged/resolved

    @ManyToOne(() => Sensor)
    sensor: Sensor;
}
