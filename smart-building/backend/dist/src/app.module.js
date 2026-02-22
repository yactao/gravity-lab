"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const site_entity_1 = require("./entities/site.entity");
const zone_entity_1 = require("./entities/zone.entity");
const sensor_entity_1 = require("./entities/sensor.entity");
const reading_entity_1 = require("./entities/reading.entity");
const alert_entity_1 = require("./entities/alert.entity");
const rule_entity_1 = require("./entities/rule.entity");
const organization_entity_1 = require("./entities/organization.entity");
const user_entity_1 = require("./entities/user.entity");
const gateway_entity_1 = require("./entities/gateway.entity");
const simulation_service_1 = require("./simulation.service");
const rules_engine_service_1 = require("./rules-engine.service");
const notifications_module_1 = require("./notifications/notifications.module");
const ai_module_1 = require("./ai/ai.module");
const auth_module_1 = require("./auth/auth.module");
const payload_formatter_service_1 = require("./iot/payload-formatter.service");
const events_gateway_1 = require("./iot/events.gateway");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: 'smartbuild_v3.sqlite',
                entities: [site_entity_1.Site, zone_entity_1.Zone, sensor_entity_1.Sensor, reading_entity_1.Reading, alert_entity_1.Alert, rule_entity_1.Rule, organization_entity_1.Organization, user_entity_1.User, gateway_entity_1.Gateway],
                synchronize: true,
                logging: false,
            }),
            typeorm_1.TypeOrmModule.forFeature([site_entity_1.Site, zone_entity_1.Zone, sensor_entity_1.Sensor, reading_entity_1.Reading, alert_entity_1.Alert, rule_entity_1.Rule, organization_entity_1.Organization, user_entity_1.User, gateway_entity_1.Gateway]),
            notifications_module_1.NotificationsModule,
            ai_module_1.AiModule,
            auth_module_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, simulation_service_1.SimulationService, rules_engine_service_1.RulesEngineService, payload_formatter_service_1.PayloadFormatterService, events_gateway_1.EventsGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map