import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history/:matchId')
  getHistory(@Param('matchId') matchId: string) {
    return this.chatService.getMessagesForMatch(matchId);
  }
}
