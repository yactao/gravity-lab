import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './entities/sensor.entity';
import { Reading } from './entities/reading.entity';
import { RulesEngineService } from './rules-engine.service';
import { EventsGateway } from './iot/events.gateway';

@Injectable()
export class SimulationService implements OnModuleInit {
    private intervalId: NodeJS.Timeout;

    constructor(
        @InjectRepository(Sensor)
        private sensorRepo: Repository<Sensor>,
        @InjectRepository(Reading)
        private readingRepo: Repository<Reading>,
        private rulesEngine: RulesEngineService,
        private eventsGateway: EventsGateway,
    ) { }

    onModuleInit() {
        console.log('🚀 Starting Internal Simulation Service...');
        this.startSimulation();
    }

    startSimulation() {
        // Generate data every 5 seconds
        this.intervalId = setInterval(async () => {
            const sensors = await this.sensorRepo.find({ relations: ['zone', 'zone.site'] });

            if (sensors.length === 0) {
                console.warn('⚠️ No sensors found to simulate data for.');
                return;
            }

            for (const sensor of sensors) {
                const value = this.generateFakeValue(sensor);

                const reading = this.readingRepo.create({
                    value: parseFloat(value.toFixed(2)),
                    timestamp: new Date(),
                    sensor: sensor,
                });

                await this.readingRepo.save(reading);

                // Evaluate rule for alerts
                await this.rulesEngine.evaluate(reading, sensor);
            }

            // Notify frontend that new data is available
            this.eventsGateway.broadcastDataRefresh();
        }, 5000);
    }

    private generateFakeValue(sensor: Sensor): number {
        const now = Date.now();

        let offset = 0;
        let scale = 1;

        // Generate site-specific and sensor-specific variations
        if (sensor.zone && sensor.zone.site) {
            const siteName = sensor.zone.site.name;
            let hash = 0;
            for (let i = 0; i < siteName.length; i++) {
                hash = siteName.charCodeAt(i) + ((hash << 5) - hash);
            }
            offset = hash % 100;
            scale = 1 + (Math.abs(hash % 50) / 100);
        }

        let sensorHash = sensor.name ? sensor.name.charCodeAt(0) : 0;
        const timeOffset = (offset * 1000) + (sensorHash * 100);

        // Simulated values tailored to the specific context
        switch (sensor.type) {
            case 'temperature':
                const baseTemp = 18 + (offset % 5); // Different baselines (13°C to 23°C)
                return baseTemp + Math.sin((now + timeOffset) / 10000) * 4 * scale;
            case 'humidity':
                const baseHum = 45 + (Math.abs(offset) % 20);
                return baseHum + Math.cos((now + timeOffset) / 15000) * 15;
            case 'co2':
                const baseCo2 = 400 + Math.abs(offset % 400); // 400 to 800 baseline
                return baseCo2 + (Math.random() * 50 * scale);
            case 'energy':
                const baseEnergy = 200 + Math.abs(offset * 25); // Baseline up to 2700W difference
                return (baseEnergy + Math.random() * 500) * scale;
            case 'hvac_energy':
                const baseHvac = 100 + Math.abs(offset * 15);
                return (baseHvac + Math.random() * 300) * scale;
            default:
                return Math.random() * 100;
        }
    }
}
