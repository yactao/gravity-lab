import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { connect, MqttClient } from 'mqtt';
import { DeviceTemplate } from '../entities/device-template.entity';

@Injectable()
export class UniversalMqttListenerService implements OnModuleInit {
    private readonly logger = new Logger(UniversalMqttListenerService.name);
    private client: MqttClient;

    constructor(
        @InjectRepository(DeviceTemplate)
        private readonly templateRepo: Repository<DeviceTemplate>
    ) { }

    onModuleInit() {
        this.client = connect('mqtt://localhost:1883');

        this.client.on('connect', () => {
            this.logger.log('✅ UniversalMqttListener Connected to MQTT Broker for No-Code integrations');
            this.client.subscribe('zigbee2mqtt/#');
            this.client.subscribe('zwavejs/#');
        });

        this.client.on('message', async (topic, message) => {
            await this.handleIncomingMessage(topic, message);
        });
    }

    async handleIncomingMessage(topic: string, messagePayload: Buffer) {
        let payloadStr = messagePayload.toString();
        try {
            const jsonPayload = JSON.parse(payloadStr);

            // 1. Obtenir les modèles et leurs mappings (mise en cache possible pour les perfs)
            const deviceTemplates = await this.templateRepo.find({
                relations: ['mappings'],
            });

            // Matcher le topicPattern (ex: 'zigbee2mqtt/+') avec le topic entrant (ex: 'zigbee2mqtt/capteur_salon')
            const matchedTemplate = deviceTemplates.find(t => {
                const patternBase = t.topicPattern.replace('/+', '').replace('/#', '');
                return topic.startsWith(patternBase);
            });

            if (!matchedTemplate || matchedTemplate.mappings.length === 0) {
                return;
            }

            const standardizedData: Record<string, any> = {};

            // 2. Parser le payload grace au mapping visuel BDD
            for (const mapping of matchedTemplate.mappings) {
                const valueInPayload = jsonPayload[mapping.sourceKey];

                if (valueInPayload === undefined) {
                    this.logger.warn(`DeviceTemplate [${matchedTemplate.name}] attend la clé [${mapping.sourceKey}] manquante dans "${topic}".`);
                    continue;
                }

                standardizedData[mapping.targetField] = valueInPayload;
            }

            // 3. Traiter la donnée standardisée (ex: router vers le flux de Mesures de TypeORM)
            if (Object.keys(standardizedData).length > 0) {
                this.logger.log(`📥 Mapping No-Code appliqué sur ${topic} -> ${JSON.stringify(standardizedData)}`);
            }

        } catch (error) {
            // Ignore si le payload n'est pas du JSON valide
        }
    }
}
