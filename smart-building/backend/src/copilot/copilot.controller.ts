import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming there is a common guard for auth

@Controller('api/copilot')
export class CopilotController {
    constructor(private readonly copilotService: CopilotService) { }

    @UseGuards(JwtAuthGuard)
    @Post('chat')
    async handleChat(@Req() req: any, @Body() body: { message: string }) {
        if (!body.message) {
            return { error: 'Message cannot be empty.' };
        }

        const user = req.user;
        const tenantId = req.headers['x-tenant-id'];

        // This simulates extraction of tenant id/user role from the request
        return await this.copilotService.processChat(body.message, tenantId, user.role);
    }
}
