import { Module } from '@nestjs/common';
import { IssuesModule } from '../issues/issues.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [IssuesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
