import { DataSource } from 'typeorm';
import { Reading } from './src/entities/reading.entity';
import { Site } from './src/entities/site.entity';
import { Zone } from './src/entities/zone.entity';
import { Sensor } from './src/entities/sensor.entity';

const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'smartbuild.sqlite',
    entities: [Site, Zone, Sensor, Reading],
});

async function check() {
    try {
        await dataSource.initialize();
        const repo = dataSource.getRepository(Reading);
        const count = await repo.count();
        const last = await repo.find({
            order: { timestamp: 'DESC' },
            take: 5,
            relations: ['sensor']
        });

        console.log(`📊 Total Readings: ${count}`);
        if (last.length > 0) {
            console.table(last.map(r => ({
                time: r.timestamp,
                value: r.value,
                sensor: r.sensor.name,
                type: r.sensor.type
            })));
        } else {
            console.log('⚠️ No readings found yet.');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Check failed:', err);
        process.exit(1);
    }
}

check();
