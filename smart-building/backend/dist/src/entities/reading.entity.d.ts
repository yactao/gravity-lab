import { Sensor } from './sensor.entity';
export declare class Reading {
    id: string;
    value: number;
    timestamp: Date;
    sensor: Sensor;
}
