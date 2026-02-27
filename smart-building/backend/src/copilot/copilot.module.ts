import { Module, forwardRef } from '@nestjs/common';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { AppModule } from '../app.module';

@Module({
    imports: [forwardRef(() => AppModule)],
    controllers: [CopilotController],
    providers: [CopilotService],
    exports: [CopilotService]
})
export class CopilotModule { }
