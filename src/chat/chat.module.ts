import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Message } from './chat.entity';
import { Poll, PollVote } from './poll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Poll, PollVote])],
  providers: [ChatService, ChatGateway, PollsService],
  controllers: [ChatController, PollsController],
  exports: [ChatService, PollsService],
})
export class ChatModule {}
