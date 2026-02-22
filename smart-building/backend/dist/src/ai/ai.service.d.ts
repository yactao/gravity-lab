export declare class AiService {
    private readonly logger;
    parseRuleRequest(prompt: string): {
        interpretations: {
            building: string;
            room: string;
            isComplex: boolean;
            triggers: {
                name: string;
                condition: string;
                value: string;
            }[];
            actions: {
                name: string;
                target: string;
            }[];
            trigger: {
                name: string;
                condition: string;
                value: string;
            };
            action: {
                name: string;
                target: string;
            };
        };
        message: string;
    };
}
