import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DeviceTemplate } from './device-template.entity';

@Entity()
export class PayloadMapping {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sourceKey: string; // La clé du JSON entrant (ex: "battery")

    @Column()
    targetField: string; // Le champ de notre BDD standard (ex: "niveau_batterie")

    // Le lien vers le Template
    @ManyToOne(() => DeviceTemplate, (template) => template.mappings, { onDelete: 'CASCADE' })
    template: DeviceTemplate;
}
