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
exports.RulesEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alert_entity_1 = require("./entities/alert.entity");
const rule_entity_1 = require("./entities/rule.entity");
const notifications_service_1 = require("./notifications/notifications.service");
let RulesEngineService = class RulesEngineService {
    alertRepo;
    ruleRepo;
    notificationsService;
    constructor(alertRepo, ruleRepo, notificationsService) {
        this.alertRepo = alertRepo;
        this.ruleRepo = ruleRepo;
        this.notificationsService = notificationsService;
    }
    async getRules(orgId) {
        const where = orgId ? { organization: { id: orgId } } : {};
        return this.ruleRepo.find({ where });
    }
    async createRule(ruleData) {
        let newRuleData = { ...ruleData };
        if (ruleData.organizationId) {
            newRuleData.organization = { id: ruleData.organizationId };
            delete newRuleData.organizationId;
        }
        const rule = this.ruleRepo.create(newRuleData);
        return this.ruleRepo.save(rule);
    }
    async evaluate(reading, sensor) {
        const activeRules = await this.ruleRepo.find({ where: { isActive: true } });
        for (const rule of activeRules) {
            if (rule.sensorType && rule.sensorType.toLowerCase() !== sensor.type.toLowerCase()) {
                continue;
            }
            let isTriggered = false;
            if (rule.conditionOperator === '>') {
                isTriggered = reading.value > rule.conditionValue;
            }
            else if (rule.conditionOperator === '<') {
                isTriggered = reading.value < rule.conditionValue;
            }
            else if (rule.conditionOperator === '=') {
                isTriggered = reading.value === rule.conditionValue;
            }
            if (isTriggered) {
                const alertMessage = `Règle déclenchée: ${rule.actionName} -> ${rule.actionTarget} (Capteur ${sensor.name} = ${reading.value})`;
                const severity = Math.random() > 0.5 ? 'CRITICAL' : 'WARNING';
                const alert = this.alertRepo.create({
                    message: alertMessage,
                    severity: severity,
                    timestamp: new Date(),
                    active: true,
                    sensor: sensor,
                });
                await this.alertRepo.save(alert);
                console.log(`⚠️ ALERT Triggered via Smart Rule [ID:${rule.id}]: ${alertMessage}`);
                if (severity === 'CRITICAL' || severity === 'WARNING') {
                    await this.notificationsService.sendNotification(rule.organizationId, `ATTENTION [${severity}] Capteur ${sensor.name} a dépassé le seuil: ${reading.value}`, ['EMAIL', 'SMS']);
                }
            }
        }
    }
};
exports.RulesEngineService = RulesEngineService;
exports.RulesEngineService = RulesEngineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alert_entity_1.Alert)),
    __param(1, (0, typeorm_1.InjectRepository)(rule_entity_1.Rule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], RulesEngineService);
//# sourceMappingURL=rules-engine.service.js.map