import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-rule')
    generateRule(@Body() body: { prompt: string }) {
        if (!body.prompt) {
            return { error: 'Prompt is missing' };
        }
        return this.aiService.parseRuleRequest(body.prompt);
    }
}
