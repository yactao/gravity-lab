import { Organization } from './organization.entity';
export declare class Rule {
    id: number;
    building: string;
    room: string;
    sensorType: string;
    conditionOperator: string;
    conditionValue: number;
    actionName: string;
    actionTarget: string;
    isActive: boolean;
    organization: Organization;
    organizationId: string;
}
