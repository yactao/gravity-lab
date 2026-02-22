"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const reading_entity_1 = require("./src/entities/reading.entity");
const site_entity_1 = require("./src/entities/site.entity");
const zone_entity_1 = require("./src/entities/zone.entity");
const sensor_entity_1 = require("./src/entities/sensor.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'better-sqlite3',
    database: 'smartbuild.sqlite',
    entities: [site_entity_1.Site, zone_entity_1.Zone, sensor_entity_1.Sensor, reading_entity_1.Reading],
});
async function check() {
    try {
        await dataSource.initialize();
        const repo = dataSource.getRepository(reading_entity_1.Reading);
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
        }
        else {
            console.log('⚠️ No readings found yet.');
        }
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Check failed:', err);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=check-db.js.map