import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, DeleteDateColumn, CreateDateColumn } from 'typeorm';
import { Gateway } from './gateway.entity';
import { Sensor } from './sensor.entity';

@Entity()
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    ieeeAddress: string;

    @Column({ nullable: true })
    friendlyName: string;

    @Column({ nullable: true })
    manufacturer: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    powerSource: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Gateway, gateway => gateway.devices, { nullable: true })
    gateway: Gateway;

    @OneToMany(() => Sensor, sensor => sensor.device)
    sensors: Sensor[];

    @DeleteDateColumn()
    deletedAt: Date;
}
