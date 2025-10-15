import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Message } from './message.entity';
import { Message } from './chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async saveMessage(data: Partial<Message>) {
    const msg = this.messageRepo.create(data);
    return this.messageRepo.save(msg);
  }

  async getMessagesForMatch(matchId: string) {
    return this.messageRepo.find({
      where: { matchId },
      order: { createdAt: 'ASC' },
    });
  }
}
