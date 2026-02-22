import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { Reading } from './entities/reading.entity';
import { Sensor } from './entities/sensor.entity';
import { Rule } from './entities/rule.entity';
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class RulesEngineService {
    constructor(
        @InjectRepository(Alert)
        private alertRepo: Repository<Alert>,
        @InjectRepository(Rule)
        private ruleRepo: Repository<Rule>,
        private notificationsService: NotificationsService,
    ) { }

    async getRules(orgId?: string) {
        const where = orgId ? { organization: { id: orgId } } : {};
        return this.ruleRepo.find({ where });
    }

    async createRule(ruleData: any) {
        // Handle organization assignment from the passed organizationId
        let newRuleData = { ...ruleData };
        if (ruleData.organizationId) {
            newRuleData.organization = { id: ruleData.organizationId };
            delete newRuleData.organizationId;
        }
        const rule = this.ruleRepo.create(newRuleData);
        return this.ruleRepo.save(rule);
    }

    async evaluate(reading: Reading, sensor: Sensor) {
        // Fetch active rules dynamically
        const activeRules = await this.ruleRepo.find({ where: { isActive: true } });

        for (const rule of activeRules) {
            // Check if rule applies to this sensor
            if (rule.sensorType && rule.sensorType.toLowerCase() !== sensor.type.toLowerCase()) {
                continue;
            }

            // Room / Building check could be added here if sensor model relates to them properly
            // For now, we evaluate conditions based on sensorType and value

            let isTriggered = false;
            if (rule.conditionOperator === '>') {
                isTriggered = reading.value > rule.conditionValue;
            } else if (rule.conditionOperator === '<') {
                isTriggered = reading.value < rule.conditionValue;
            } else if (rule.conditionOperator === '=') {
                isTriggered = reading.value === rule.conditionValue;
            }

            if (isTriggered) {
                const alertMessage = `Règle déclenchée: ${rule.actionName} -> ${rule.actionTarget} (Capteur ${sensor.name} = ${reading.value})`;
                const severity = Math.random() > 0.5 ? 'CRITICAL' : 'WARNING'; // Randomize severity for demo 

                const alert = this.alertRepo.create({
                    message: alertMessage,
                    severity: severity,
                    timestamp: new Date(),
                    active: true,
                    sensor: sensor,
                });
                await this.alertRepo.save(alert);
                console.log(`⚠️ ALERT Triggered via Smart Rule [ID:${rule.id}]: ${alertMessage}`);

                // Trigger Advanced Notifications
                if (severity === 'CRITICAL' || severity === 'WARNING') {
                    await this.notificationsService.sendNotification(
                        rule.organizationId,
                        `ATTENTION [${severity}] Capteur ${sensor.name} a dépassé le seuil: ${reading.value}`,
                        ['EMAIL', 'SMS']
                    );
                }
            }
        }
    }
}
