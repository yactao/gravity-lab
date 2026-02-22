import { DataSource } from 'typeorm';
import { Site } from './src/entities/site.entity';
import { Zone } from './src/entities/zone.entity';
import { Sensor } from './src/entities/sensor.entity';
import { Reading } from './src/entities/reading.entity';

const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'smartbuild.sqlite',
    entities: [Site, Zone, Sensor, Reading],
    synchronize: true,
});

async function bootstrap() {
    await dataSource.initialize();
    console.log('🌱 Seeding Database...');

    const siteRepo = dataSource.getRepository(Site);
    const zoneRepo = dataSource.getRepository(Zone);
    const sensorRepo = dataSource.getRepository(Sensor);

    // 1. Create Site
    let site = await siteRepo.findOneBy({ name: 'Siège Social' });
    if (!site) {
        site = siteRepo.create({
            name: 'Siège Social',
            address: '123 Avenue de l\'Innovation',
            city: 'Paris',
        });
        await siteRepo.save(site);
        console.log('✅ Site created');
    }

    // 2. Create Zone
    let zone = await zoneRepo.findOneBy({ name: 'Open Space R+1' });
    if (!zone) {
        zone = zoneRepo.create({
            name: 'Open Space R+1',
            type: 'Office',
            site: site,
        });
        await zoneRepo.save(zone);
        console.log('✅ Zone created');
    }

    // 3. Create Sensor
    let sensor = await sensorRepo.findOneBy({ externalId: 'demo_sensor_01' });
    if (!sensor) {
        sensor = sensorRepo.create({
            externalId: 'demo_sensor_01',
            name: 'Capteur Températion Sud',
            type: 'temperature',
            unit: '°C',
            zone: zone,
        });
        await sensorRepo.save(sensor);
        console.log('✅ Sensor created');
    }

    console.log('🏁 Seeding complete!');
    process.exit(0);
}

bootstrap().catch((err) => {
    console.error('❌ Seeding failed', err);
    process.exit(1);
});
