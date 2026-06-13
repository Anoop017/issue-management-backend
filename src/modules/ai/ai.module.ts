import { Module } from '@nestjs/common';
import { IssuesModule } from '../issues/issues.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [IssuesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
