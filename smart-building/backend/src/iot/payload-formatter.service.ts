import { Injectable, Logger } from '@nestjs/common';

export interface DecodedPayload {
    temperature?: number;
    humidity?: number;
    co2?: number;
    presence?: boolean;
    power?: number;
    battery?: number;
}

@Injectable()
export class PayloadFormatterService {
    private readonly logger = new Logger(PayloadFormatterService.name);

    /**
     * Main entry point to decode a payload based on the sensor type
     */
    decode(deviceType: string, rawPayload: any): DecodedPayload | null {
        try {
            this.logger.debug(`Decoding payload for ${deviceType}: ${JSON.stringify(rawPayload)}`);

            switch (deviceType?.toLowerCase()) {
                case 'adeunis':
                    return this.decodeAdeunis(rawPayload);
                case 'enocean':
                    return this.decodeEnOcean(rawPayload);
                case 'elsys':
                    return this.decodeElsys(rawPayload);
                case 'milesight':
                    return this.decodeMilesight(rawPayload);
                case 'generic':
                case 'json':
                    return this.decodeGeneric(rawPayload);
                default:
                    this.logger.warn(`Unknown device type: ${deviceType}. Trying generic JSON decode.`);
                    return this.decodeGeneric(rawPayload);
            }
        } catch (error: any) {
            this.logger.error(`Failed to decode payload for ${deviceType}: ${error.message}`);
            return null;
        }
    }

    // Example decoder for Adeunis (Hex payload like "0100E1")
    // For demonstration: bytes [1,2] are temperature (00E1 -> 225 -> 22.5°C)
    private decodeAdeunis(payload: any): DecodedPayload {
        const data = payload.data || payload; // Hex string
        if (typeof data !== 'string' || data.length < 6) return {};

        const tempHex = data.substring(2, 6);
        const temperature = parseInt(tempHex, 16) / 10;

        return { temperature };
    }

    // Example decoder for EnOcean
    private decodeEnOcean(payload: any): DecodedPayload {
        return {
            presence: payload.occuState === 1 || payload.presence === true
        };
    }

    // Example decoder for Elsys
    private decodeElsys(payload: any): DecodedPayload {
        return {
            co2: payload.co2 || undefined,
            temperature: payload.temperature || undefined,
            humidity: payload.humidity || undefined,
        };
    }

    // Example decoder for Milesight
    private decodeMilesight(payload: any): DecodedPayload {
        return {
            temperature: payload.temperature,
            humidity: payload.humidity,
            co2: payload.co2
        };
    }

    // Generic JSON decoder
    private decodeGeneric(payload: any): DecodedPayload {
        return {
            temperature: payload.temperature || payload.temp,
            humidity: payload.humidity || payload.hum,
            co2: payload.co2 || payload.carbonDioxide,
            presence: payload.presence || payload.occupancy || payload.motion,
            power: payload.power || payload.w,
            battery: payload.battery || payload.bat || payload.batteryLevel,
        };
    }
}
