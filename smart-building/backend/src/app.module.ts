import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Site } from './entities/site.entity';
import { Zone } from './entities/zone.entity';
import { Sensor } from './entities/sensor.entity';
import { Reading } from './entities/reading.entity';
import { Alert } from './entities/alert.entity';
import { Rule } from './entities/rule.entity';
import { Organization } from './entities/organization.entity';
import { User } from './entities/user.entity';
import { Gateway } from './entities/gateway.entity';
import { SimulationService } from './simulation.service';
import { RulesEngineService } from './rules-engine.service';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { PayloadFormatterService } from './iot/payload-formatter.service';
import { EventsGateway } from './iot/events.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'smartbuild_v3.sqlite',
      entities: [Site, Zone, Sensor, Reading, Alert, Rule, Organization, User, Gateway],
      synchronize: true, // Auto-create tables (Dev only)
      logging: false, // Turn off logging to reduce noise
    }),
    TypeOrmModule.forFeature([Site, Zone, Sensor, Reading, Alert, Rule, Organization, User, Gateway]),
    NotificationsModule,
    AiModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, SimulationService, RulesEngineService, PayloadFormatterService, EventsGateway],
})
export class AppModule { }
