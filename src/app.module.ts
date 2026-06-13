import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsModule } from './modules/comments/comments.module';
import { IssuesModule } from './modules/issues/issues.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, IssuesModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
