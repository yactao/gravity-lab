import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Sensor } from './entities/sensor.entity';
import { Reading } from './entities/reading.entity';
import { RulesEngineService } from './rules-engine.service';
import { EventsGateway } from './iot/events.gateway';
export declare class SimulationService implements OnModuleInit {
    private sensorRepo;
    private readingRepo;
    private rulesEngine;
    private eventsGateway;
    private intervalId;
    constructor(sensorRepo: Repository<Sensor>, readingRepo: Repository<Reading>, rulesEngine: RulesEngineService, eventsGateway: EventsGateway);
    onModuleInit(): void;
    startSimulation(): void;
    private generateFakeValue;
}
