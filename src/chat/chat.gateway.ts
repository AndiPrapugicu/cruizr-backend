// src/chat/chat.gateway.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
@WebSocketGateway({ cors: true })
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, matchId: string) {
    console.log(`📊 [CHAT-GATEWAY] User joining room: ${matchId}`);
    client.join(matchId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, matchId: string) {
    client.leave(matchId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: { text: string; matchId: string },
  ) {
    // 1) Preia token-ul din handshake.auth (trim pentru a elimina spații)
    let token: string | undefined;
    if (
      client.handshake.auth &&
      typeof client.handshake.auth.token === 'string'
    ) {
      token = client.handshake.auth.token.trim();
    }

    this.logger.debug(`TOKEN primit în sendMessage: ${token}`);

    // 2) Citește secretul din ConfigService
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      this.logger.error(
        'Eroare: JWT_SECRET nu este definit în configurație! (ConfigService)',
      );
      // Putem alege să respingem imediat cererea sau să continuăm cu userName = 'Anonim'
    }

    let userName = 'Anonim';

    if (token && jwtSecret) {
      try {
        // 3) Verifică token-ul folosind același secret
        const payload: any = jwt.verify(token, jwtSecret);
        this.logger.debug(`PAYLOAD JWT: ${JSON.stringify(payload)}`);
        // 4) Extrage numele sau email-ul din payload (după cum ai definit tu când ai generat token-ul)
        userName = payload.name || payload.email || 'Anonim';
      } catch (err) {
        this.logger.warn(`JWT invalid sau expirat: ${(err as Error).message}`);
        // În acest caz, userName rămâne 'Anonim'
      }
    }

    // 5) Salvează mesajul cu from = userName
    const saved = await this.chatService.saveMessage({
      ...message,
      from: userName,
    });

    // 6) Emită celor conectați în camera (room) corespunzătoare
    this.server.to(message.matchId).emit('receiveMessage', saved);
  }

  @SubscribeMessage('createPoll')
  async handleCreatePoll(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    pollData: {
      question: string;
      options: string[];
      matchId: string;
      type?: string;
    },
  ) {
    // Extract user from token
    let token: string | undefined;
    if (client.handshake.auth && typeof client.handshake.auth.token === 'string') {
      token = client.handshake.auth.token.trim();
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    let userName = 'Anonim';
    let userId = 0;

    if (token && jwtSecret) {
      try {
        const payload: any = jwt.verify(token, jwtSecret);
        userName = payload.name || payload.email || 'Anonim';
        userId = payload.sub || 0;
      } catch (err) {
        this.logger.warn(`JWT invalid: ${(err as Error).message}`);
      }
    }

    // Don't create poll message in chat, just emit notification
    // Emit poll notification to all users in the match
    console.log(`📊 [CHAT-GATEWAY] Emitting pollCreated event to room: ${pollData.matchId}`);
    this.server.to(pollData.matchId).emit('pollCreated', {
      type: 'poll-notification',
      pollType: 'custom',
      question: pollData.question,
      createdBy: userName,
      matchId: pollData.matchId,
    });
    console.log(`📊 [CHAT-GATEWAY] Poll notification sent for question: ${pollData.question}`);
  }

  @SubscribeMessage('votePoll')
  async handleVotePoll(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    voteData: { pollMessageId: string; optionIndex: number; matchId: string },
  ) {
    // Extract user from token
    let token: string | undefined;
    if (client.handshake.auth && typeof client.handshake.auth.token === 'string') {
      token = client.handshake.auth.token.trim();
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    let userName = 'Anonim';

    if (token && jwtSecret) {
      try {
        const payload: any = jwt.verify(token, jwtSecret);
        userName = payload.name || payload.email || 'Anonim';
      } catch (err) {
        this.logger.warn(`JWT invalid: ${(err as Error).message}`);
      }
    }

    // Update poll results (this would normally update database)
    // For now, emit real-time vote update
    this.server.to(voteData.matchId).emit('pollVoteUpdate', {
      pollMessageId: voteData.pollMessageId,
      voter: userName,
      optionIndex: voteData.optionIndex,
    });
  }

  @SubscribeMessage('sendQuickPoll')
  async handleQuickPoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() quickPollData: { type: string; matchId: string },
  ) {
    // Extract user from token
    let token: string | undefined;
    if (client.handshake.auth && typeof client.handshake.auth.token === 'string') {
      token = client.handshake.auth.token.trim();
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    let userName = 'Anonim';

    if (token && jwtSecret) {
      try {
        const payload: any = jwt.verify(token, jwtSecret);
        userName = payload.name || payload.email || 'Anonim';
      } catch (err) {
        this.logger.warn(`JWT invalid: ${(err as Error).message}`);
      }
    }

    // Predefined quick polls
    const quickPolls = {
      brand_preference: {
        question: 'Ce brand preferi?',
        options: ['BMW', 'Audi', 'Mercedes', 'Volkswagen'],
      },
      fuel_type: {
        question: 'Ce tip de combustibil preferi?',
        options: ['Benzină', 'Diesel', 'Electric', 'Hibrid'],
      },
      car_style: {
        question: 'Ce stil de mașină îți place?',
        options: ['Sedan', 'SUV', 'Hatchback', 'Coupe'],
      },
    };

    const pollTemplate = quickPolls[quickPollData.type];
    if (!pollTemplate) {
      return;
    }

    // Don't create poll message in chat, just emit notification
    // Emit quick poll notification to all users in the match
    this.server.to(quickPollData.matchId).emit('quickPollCreated', {
      type: 'poll-notification',
      pollType: 'quick',
      question: pollTemplate.question,
      createdBy: userName,
      matchId: quickPollData.matchId,
    });
  }
}
