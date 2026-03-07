import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Reading } from './entities/reading.entity';
import { Sensor } from './entities/sensor.entity';
import { Gateway } from './entities/gateway.entity';
export declare class MqttService implements OnModuleInit {
    private readingRepo;
    private sensorRepo;
    private gatewayRepo;
    private client;
    constructor(readingRepo: Repository<Reading>, sensorRepo: Repository<Sensor>, gatewayRepo: Repository<Gateway>);
    onModuleInit(): void;
    private handleHandshake;
    private handleMessage;
    private guessUnit;
}
