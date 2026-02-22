"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const site_entity_1 = require("./src/entities/site.entity");
const zone_entity_1 = require("./src/entities/zone.entity");
const sensor_entity_1 = require("./src/entities/sensor.entity");
const reading_entity_1 = require("./src/entities/reading.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'better-sqlite3',
    database: 'smartbuild.sqlite',
    entities: [site_entity_1.Site, zone_entity_1.Zone, sensor_entity_1.Sensor, reading_entity_1.Reading],
    synchronize: true,
});
async function bootstrap() {
    await dataSource.initialize();
    console.log('🌱 Seeding Database...');
    const siteRepo = dataSource.getRepository(site_entity_1.Site);
    const zoneRepo = dataSource.getRepository(zone_entity_1.Zone);
    const sensorRepo = dataSource.getRepository(sensor_entity_1.Sensor);
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
//# sourceMappingURL=seed.js.map