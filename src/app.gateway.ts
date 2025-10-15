import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `user_${data.userId}`;
    void client.join(room);
    console.log(`[SOCKET] User ${data.userId} joined room ${room}`);
  }

  // Emit event to specific user
  emitToUser(userId: number, event: string, data: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit(event, data);
    console.log(`[SOCKET] Emitted ${event} to user ${userId}:`, data);
  }
}
