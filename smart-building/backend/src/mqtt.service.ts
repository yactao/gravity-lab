import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reading } from './entities/reading.entity';
import { Sensor } from './entities/sensor.entity';
import { Gateway } from './entities/gateway.entity';
import { Device } from './entities/device.entity';
import { EventsGateway } from './iot/events.gateway';

@Injectable()
export class MqttService implements OnModuleInit {
    private client: MqttClient;

    public publishCommand(macAddress: string, command: any) {
        const topic = `ubbee/command/${macAddress}`;
        const payload = JSON.stringify(command);
        console.log(`📤 Envoi MQTT vers ${topic} :`, payload);
        if (this.client) {
            this.client.publish(topic, payload);
        }
    }

    constructor(
        @InjectRepository(Reading)
        private readingRepo: Repository<Reading>,
        @InjectRepository(Sensor)
        private sensorRepo: Repository<Sensor>,
        @InjectRepository(Gateway)
        private gatewayRepo: Repository<Gateway>,
        @InjectRepository(Device)
        private deviceRepo: Repository<Device>,
        private eventsGateway: EventsGateway,
    ) { }

    onModuleInit() {
        this.client = connect('mqtt://localhost:1883');

        this.client.on('connect', () => {
            console.log('✅ Connected to MQTT Broker');
            this.client.subscribe('smartbuilding/#');
            this.client.subscribe('ubbee/provisioning/handshake');
            this.client.subscribe('zigbee2mqtt/bridge/devices');
        });

        this.client.on('message', async (topic, message) => {
            try {
                let msgStr = message.toString();

                if (topic.includes('telemetry')) {
                    console.log(`[MQTT RAW] ${topic}: ${msgStr.substring(0, 50)}...`);
                }

                // If python dict string, sanitize it gently to valid JSON format: (' -> ")
                if (msgStr.includes("'")) {
                    msgStr = msgStr.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false');
                }

                let payload;
                try {
                    payload = JSON.parse(msgStr);
                } catch (e) {
                    console.error("Failed to parse JSON payload:", msgStr);
                    return;
                }

                // Broadcase parsed payload to UI console
                this.eventsGateway.server.emit('mqtt_stream', { topic, payload, time: new Date().toISOString() });

                if (topic === 'ubbee/provisioning/handshake') {
                    await this.handleHandshake(payload);
                } else if (topic === 'zigbee2mqtt/bridge/devices') {
                    await this.handleZigbeeDevices(payload);
                } else if (topic.includes('telemetry')) {
                    await this.handleMessage(topic, payload);
                }
            } catch (err) {
                // Silent catch for non-JSON unless it looks like it was meant for us
                if (message.toString().includes("device_id") || message.toString().includes("mac")) {
                    console.error(`❌ Error parsing MQTT message on ${topic}:`, err.message);
                }
            }
        });
    }

    private async handleHandshake(payload: any) {
        const { mac } = payload;
        if (!mac) return;

        console.log(`🔌 Handshake reçu pour la MAC: ${mac}`);

        // Vérifier dans la base de données si une passerelle a été provisionnée avec cette MAC
        const gateway = await this.gatewayRepo.findOne({
            where: { serialNumber: mac },
            relations: ['site']
        });

        if (!gateway) {
            console.log(`⚠️ U-Bot inconnu (${mac}), handshake refusé.`);
            return;
        }

        // Si la Gateway est trouvée, on la passe "en ligne"
        gateway.status = 'online';
        await this.gatewayRepo.save(gateway);

        const buildingId = gateway.site ? gateway.site.id : 'unknown-building';
        console.log(`✅ U-Bot reconnu et passé online ! Assigation au site : ${buildingId}`);

        // Réponse Cloud (Descente de configuration)
        const configData = {
            building_id: buildingId,
            status: 'approved',
            timestamp: new Date().toISOString()
        };

        this.client.publish(`ubbee/provisioning/${mac}/config`, JSON.stringify(configData));
    }

    private async handleZigbeeDevices(payload: any) {
        if (!Array.isArray(payload)) return;

        for (const dev of payload) {
            if (!dev.ieee_address) continue;
            let device = await this.deviceRepo.findOne({ where: { ieeeAddress: dev.ieee_address } });
            if (!device) {
                device = this.deviceRepo.create({
                    ieeeAddress: dev.ieee_address,
                    friendlyName: dev.friendly_name,
                    manufacturer: dev.manufacturer,
                    model: dev.model,
                    type: dev.type,
                    powerSource: dev.power_source,
                });
            } else {
                device.friendlyName = dev.friendly_name;
                device.manufacturer = dev.manufacturer;
                device.model = dev.model;
                device.type = dev.type;
                device.powerSource = dev.power_source;
            }
            await this.deviceRepo.save(device);
        }
    }

    private async handleMessage(topic: string, payload: any) {
        // Expected Payload: { device_id: "...", sensor_id?: "...", data: { temperature: 21.5, ... }, timestamp: "..." }
        const { device_id, sensor_id, data, timestamp } = payload;
        if (!data || (!device_id && !sensor_id)) return;

        let gateway: Gateway | null = null;
        let defaultZone = undefined;
        if (device_id) {
            gateway = await this.gatewayRepo.findOne({ where: { serialNumber: device_id }, relations: ['site', 'site.zones'] });
            if (gateway && gateway.site && gateway.site.zones && gateway.site.zones.length > 0) {
                if (payload.zone_id) {
                    defaultZone = gateway.site.zones.find(z => z.id === payload.zone_id) || gateway.site.zones[0];
                } else {
                    defaultZone = gateway.site.zones[0];
                }
            }
        }

        const hardware_id = sensor_id || device_id;

        // Try to identify hardware device from DB
        let device = null;
        if (hardware_id) {
            device = await this.deviceRepo.findOne({
                where: [{ friendlyName: hardware_id }, { ieeeAddress: hardware_id }]
            });
        }

        // 1. Find or Create Sensor(s) based on data keys
        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'string') continue;

            const sensorExternalId = `${hardware_id}_${key}`;
            let sensor = await this.sensorRepo.findOne({ where: { externalId: sensorExternalId }, relations: ['gateway', 'zone', 'device'] });

            if (!sensor) {
                // Create Sensor on the fly (Auto-discovery)
                sensor = this.sensorRepo.create({
                    externalId: sensorExternalId,
                    name: `${key} (${hardware_id})`,
                    type: key, // Keep exactly as Z2M states (e.g. 'occupancy' or 'presence') for data mapping, display rules apply on UI.
                    unit: this.guessUnit(key),
                    gateway: gateway || undefined,
                    device: device || undefined,
                    zone: defaultZone
                });
                await this.sensorRepo.save(sensor);
                console.log(`🆕 New Sensor Discovered: ${sensor.name}` + (gateway ? ` (Attached to Gateway ${gateway.serialNumber})` : '') + (defaultZone ? ` (Zone: ${defaultZone.name})` : ''));
            } else {
                let updated = false;
                if (!sensor.gateway && gateway) {
                    sensor.gateway = gateway;
                    updated = true;
                }
                if (!sensor.zone && defaultZone) {
                    sensor.zone = defaultZone;
                    updated = true;
                }
                if (!sensor.device && device) {
                    sensor.device = device;
                    updated = true;
                }
                if (updated) {
                    await this.sensorRepo.save(sensor);
                }
            }

            // 2. Save Reading
            // For boolean/string values, we might need a different storage strategy or conversion
            // Here we assume 'value' column is float, so we convert boolean to 1/0
            let numericValue = value;
            if (typeof value === 'boolean') numericValue = value ? 1 : 0;
            if (typeof value === 'string') continue; // Skip strings for now or add a string_value column

            const reading = this.readingRepo.create({
                value: Number(numericValue),
                timestamp: new Date(timestamp),
                sensor: sensor,
            });

            await this.readingRepo.save(reading);
            // console.log(`💾 Saved ${key}: ${numericValue}`);
        }
    }

    private guessUnit(key: string): string {
        if (key.includes('temp')) return '°C';
        if (key.includes('humid')) return '%';
        if (key.includes('co2')) return 'ppm';
        if (key.includes('power')) return 'W';
        return '';
    }
}
