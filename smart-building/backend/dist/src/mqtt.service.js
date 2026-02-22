"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttService = void 0;
const common_1 = require("@nestjs/common");
const mqtt_1 = require("mqtt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reading_entity_1 = require("./entities/reading.entity");
const sensor_entity_1 = require("./entities/sensor.entity");
let MqttService = class MqttService {
    readingRepo;
    sensorRepo;
    client;
    constructor(readingRepo, sensorRepo) {
        this.readingRepo = readingRepo;
        this.sensorRepo = sensorRepo;
    }
    onModuleInit() {
        this.client = (0, mqtt_1.connect)('mqtt://localhost:1883');
        this.client.on('connect', () => {
            console.log('✅ Connected to MQTT Broker');
            this.client.subscribe('smartbuilding/+/+/telemetry');
        });
        this.client.on('message', async (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());
                await this.handleMessage(payload);
            }
            catch (err) {
                console.error('❌ Error processing MQTT message:', err);
            }
        });
    }
    async handleMessage(payload) {
        const { device_id, data, timestamp } = payload;
        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'string')
                continue;
            const sensorExternalId = `${device_id}_${key}`;
            let sensor = await this.sensorRepo.findOne({ where: { externalId: sensorExternalId } });
            if (!sensor) {
                sensor = this.sensorRepo.create({
                    externalId: sensorExternalId,
                    name: `${key} (${device_id})`,
                    type: key,
                    unit: this.guessUnit(key),
                });
                await this.sensorRepo.save(sensor);
                console.log(`🆕 New Sensor Discovered: ${sensor.name}`);
            }
            let numericValue = value;
            if (typeof value === 'boolean')
                numericValue = value ? 1 : 0;
            if (typeof value === 'string')
                continue;
            const reading = this.readingRepo.create({
                value: Number(numericValue),
                timestamp: new Date(timestamp),
                sensor: sensor,
            });
            await this.readingRepo.save(reading);
        }
    }
    guessUnit(key) {
        if (key.includes('temp'))
            return '°C';
        if (key.includes('humid'))
            return '%';
        if (key.includes('co2'))
            return 'ppm';
        if (key.includes('power'))
            return 'W';
        return '';
    }
};
exports.MqttService = MqttService;
exports.MqttService = MqttService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reading_entity_1.Reading)),
    __param(1, (0, typeorm_1.InjectRepository)(sensor_entity_1.Sensor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MqttService);
//# sourceMappingURL=mqtt.service.js.map