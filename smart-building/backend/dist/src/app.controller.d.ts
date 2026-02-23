import { AppService } from './app.service';
import { RulesEngineService } from './rules-engine.service';
export declare class AppController {
    private readonly appService;
    private readonly rulesEngineService;
    constructor(appService: AppService, rulesEngineService: RulesEngineService);
    getHello(): string;
    getSites(orgId: string): Promise<import("./entities/site.entity").Site[]>;
    getOrganizations(): Promise<{
        sitesCount: number;
        usersCount: number;
        devicesCount: number;
        id: string;
        name: string;
        type: string;
        country: string;
        region: string;
        city: string;
        address: string;
        phone: string;
        email: string;
        establishmentDate: string;
        legalForm: string;
        subscriptionPlan: string;
        maxUsers: number;
        maxDevices: number;
        maxSites: number;
        createdAt: Date;
        users: import("./entities/user.entity").User[];
        sites: import("./entities/site.entity").Site[];
    }[]>;
    createOrganization(orgData: any): Promise<import("./entities/organization.entity").Organization[]>;
    updateOrganization(id: string, orgData: any): Promise<import("./entities/organization.entity").Organization | null>;
    deleteOrganization(id: string): Promise<import("typeorm").DeleteResult>;
    createSite(orgId: string, siteData: any): Promise<import("./entities/site.entity").Site[]>;
    createZone(zoneData: any): Promise<import("./entities/zone.entity").Zone[]>;
    getSensors(orgId: string): Promise<import("./entities/sensor.entity").Sensor[]>;
    getGateways(orgId: string): Promise<import("./entities/gateway.entity").Gateway[]>;
    createGateway(gatewayData: any): Promise<import("./entities/gateway.entity").Gateway[]>;
    getReadings(limit?: string, orgId?: string): Promise<import("./entities/reading.entity").Reading[]>;
    getGlobalEnergy(orgId: string, siteId?: string): Promise<{
        timestamp: string;
        globalValue: number;
        hvacValue: number;
        unit: string;
    }[]>;
    getAverageTemperature(orgId: string, siteId?: string): Promise<{
        day: string;
        averageTemp: number;
    }[]>;
    getAlerts(orgId: string, siteId?: string): Promise<import("./entities/alert.entity").Alert[]>;
    getHvacPerformance(orgId: string, siteId?: string): Promise<{
        day: string;
        runtime: number;
        setpoint: number;
        actual: number;
    }[]>;
    getRules(orgId: string): Promise<import("./entities/rule.entity").Rule[]>;
    createRule(orgId: string, ruleData: any): Promise<import("./entities/rule.entity").Rule[]>;
    processIotWebhook(webhookData: any): Promise<{
        success: boolean;
        readingId: string;
        decoded: import("./iot/payload-formatter.service").DecodedPayload;
    }>;
    globalSearch(q: string, orgId: string, role: string): Promise<any[]>;
}
