import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Reading } from './entities/reading.entity';
import { Sensor } from './entities/sensor.entity';
export declare class MqttService implements OnModuleInit {
    private readingRepo;
    private sensorRepo;
    private client;
    constructor(readingRepo: Repository<Reading>, sensorRepo: Repository<Sensor>);
    onModuleInit(): void;
    private handleMessage;
    private guessUnit;
}
