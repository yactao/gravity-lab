import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PayloadMapping } from './payload-mapping.entity';

@Entity()
export class DeviceTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // ex: "Capteur Température Zigbee"

    @Column()
    topicPattern: string; // ex: "zigbee2mqtt/+"

    // Un template possède plusieurs règles de mapping
    @OneToMany(() => PayloadMapping, (mapping) => mapping.template, { cascade: true })
    mappings: PayloadMapping[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
