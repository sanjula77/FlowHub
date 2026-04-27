import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './label.entity';
import { TaskLabel } from './task-label.entity';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { LabelRepository } from './repositories/label.repository';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Label, TaskLabel]),
    TeamsModule,
    UsersModule,
  ],
  controllers: [LabelsController],
  providers: [LabelsService, LabelRepository],
  exports: [LabelsService, LabelRepository],
})
export class LabelsModule {}
