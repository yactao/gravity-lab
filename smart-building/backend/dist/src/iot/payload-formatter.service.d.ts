export interface DecodedPayload {
    temperature?: number;
    humidity?: number;
    co2?: number;
    presence?: boolean;
    power?: number;
    battery?: number;
}
export declare class PayloadFormatterService {
    private readonly logger;
    decode(deviceType: string, rawPayload: any): DecodedPayload | null;
    private decodeAdeunis;
    private decodeEnOcean;
    private decodeElsys;
    private decodeMilesight;
    private decodeGeneric;
}
