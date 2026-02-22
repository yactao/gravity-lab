import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Module({
    providers: [NotificationsService],
    exports: [NotificationsService], // Exported so other modules (like Rules or Simulation) can use it
})
export class NotificationsModule { }
