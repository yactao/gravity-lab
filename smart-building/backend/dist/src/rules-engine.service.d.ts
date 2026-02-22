import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { Reading } from './entities/reading.entity';
import { Sensor } from './entities/sensor.entity';
import { Rule } from './entities/rule.entity';
import { NotificationsService } from './notifications/notifications.service';
export declare class RulesEngineService {
    private alertRepo;
    private ruleRepo;
    private notificationsService;
    constructor(alertRepo: Repository<Alert>, ruleRepo: Repository<Rule>, notificationsService: NotificationsService);
    getRules(orgId?: string): Promise<Rule[]>;
    createRule(ruleData: any): Promise<Rule[]>;
    evaluate(reading: Reading, sensor: Sensor): Promise<void>;
}
