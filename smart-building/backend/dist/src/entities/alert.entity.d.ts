import { Sensor } from './sensor.entity';
export declare class Alert {
    id: string;
    message: string;
    severity: string;
    timestamp: Date;
    active: boolean;
    sensor: Sensor;
}
