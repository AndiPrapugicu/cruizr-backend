// src/matches/matches.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SwipeDto } from './dto/swipe.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async getMatches(@Req() req) {
    return this.matchesService.getMatchesForUser(+req.user.userId);
  }

  @Post()
  async createMatch(@Req() req, @Body() body: { userBId: number }) {
    return this.matchesService.create(+req.user.userId, body.userBId);
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { status: 'accepted' | 'rejected' },
  ) {
    return this.matchesService.updateStatus(+id, body.status);
  }

  @Get('received-likes')
  async getReceivedLikes(@Req() req) {
    return this.matchesService.getReceivedLikes(+req.user.userId);
  }

  @Get('received-super-likes')
  async getReceivedSuperLikes(@Req() req) {
    return this.matchesService.getReceivedSuperLikes(+req.user.userId);
  }

  @Get('recent-matches')
  @Post('swipe')
  async swipe(@Req() req, @Body() body: SwipeDto) {
    const fromUserId = +req.user.userId;
    const { userId: toUserId, direction } = body;
    console.log('💖 Processing swipe:', { fromUserId, toUserId, direction });
    if (!toUserId || !direction) {
      throw new BadRequestException('userId și direction sunt obligatorii');
    }
    const result = await this.matchesService.swipe(
      fromUserId,
      toUserId,
      direction,
    );
    console.log('💖 Swipe result:', result);
    return result;
  }

  @Post('respond-to-match')
  async respondToMatch(
    @Req() req,
    @Body() body: { matchId: number; response: 'accept' | 'reject' },
  ) {
    const userId = +req.user.userId;
    const { matchId, response } = body;
    console.log('💖 Processing match response:', { userId, matchId, response });
    if (!matchId || !response) {
      throw new BadRequestException('matchId și response sunt obligatorii');
    }
    const result = await this.matchesService.respondToMatch(
      userId,
      matchId,
      response,
    );
    console.log('💖 Match response result:', result);
    return result;
  }

  @Get('has-swiped/:toUserId')
  async hasSwiped(@Req() req, @Param('toUserId') toUserId: number) {
    const fromUserId = +req.user.userId;
    return this.matchesService.checkRecentSwipe(fromUserId, +toUserId);
  }

  // Metoda nouă care folosește getSwipesByUser din MatchesService
  @Get('me')
  async getMySwipes(@Req() req) {
    return this.matchesService.getSwipesByUser(+req.user.userId);
  }

  // ─────────── NOUL ENDPOINT PENTRU REPORT/ BLOCK ───────────
  @Post(':id/report')
  async reportMatch(@Req() req, @Param('id') id: number) {
    const reporterUserId = +req.user.userId;
    await this.matchesService.reportMatch(id, reporterUserId);
    return { message: 'Match raportat şi blocat cu succes.' };
  }
}
