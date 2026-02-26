import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceTemplate } from './entities/device-template.entity';
import { PayloadMapping } from './entities/payload-mapping.entity';

@Controller('api/integrations')
export class IntegrationsController {
    constructor(
        @InjectRepository(DeviceTemplate)
        private readonly templateRepo: Repository<DeviceTemplate>
    ) { }

    @Post('mapping')
    async saveMapping(@Body() body: any) {
        const { templateName, topicPattern, mappings } = body;

        // 1. Sauvegarder le modèle "DeviceTemplate"
        const newTemplate = this.templateRepo.create({
            name: templateName,
            topicPattern: topicPattern,
            mappings: mappings.map((m: any) => ({
                sourceKey: m.sourceKey,
                targetField: m.targetField
            }))
        });

        const saved = await this.templateRepo.save(newTemplate);

        return { success: true, templateId: saved.id };
    }
}
