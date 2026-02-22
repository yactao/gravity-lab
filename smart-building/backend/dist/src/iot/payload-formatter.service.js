"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PayloadFormatterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadFormatterService = void 0;
const common_1 = require("@nestjs/common");
let PayloadFormatterService = PayloadFormatterService_1 = class PayloadFormatterService {
    logger = new common_1.Logger(PayloadFormatterService_1.name);
    decode(deviceType, rawPayload) {
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
        }
        catch (error) {
            this.logger.error(`Failed to decode payload for ${deviceType}: ${error.message}`);
            return null;
        }
    }
    decodeAdeunis(payload) {
        const data = payload.data || payload;
        if (typeof data !== 'string' || data.length < 6)
            return {};
        const tempHex = data.substring(2, 6);
        const temperature = parseInt(tempHex, 16) / 10;
        return { temperature };
    }
    decodeEnOcean(payload) {
        return {
            presence: payload.occuState === 1 || payload.presence === true
        };
    }
    decodeElsys(payload) {
        return {
            co2: payload.co2 || undefined,
            temperature: payload.temperature || undefined,
            humidity: payload.humidity || undefined,
        };
    }
    decodeMilesight(payload) {
        return {
            temperature: payload.temperature,
            humidity: payload.humidity,
            co2: payload.co2
        };
    }
    decodeGeneric(payload) {
        return {
            temperature: payload.temperature || payload.temp,
            humidity: payload.humidity || payload.hum,
            co2: payload.co2 || payload.carbonDioxide,
            presence: payload.presence || payload.occupancy || payload.motion,
            power: payload.power || payload.w,
            battery: payload.battery || payload.bat || payload.batteryLevel,
        };
    }
};
exports.PayloadFormatterService = PayloadFormatterService;
exports.PayloadFormatterService = PayloadFormatterService = PayloadFormatterService_1 = __decorate([
    (0, common_1.Injectable)()
], PayloadFormatterService);
//# sourceMappingURL=payload-formatter.service.js.map