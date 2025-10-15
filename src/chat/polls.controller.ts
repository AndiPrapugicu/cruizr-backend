import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PollsService, CreatePollDto, VotePollDto } from './polls.service';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Post('create')
  async createPoll(@Request() req, @Body() createPollDto: CreatePollDto) {
    const userId = req.user?.userId;
    console.log('🗳️ Creating poll for user:', userId);
    return this.pollsService.createPoll(userId, createPollDto);
  }

  @Post('quick/:type/:matchId')
  async createQuickPoll(
    @Request() req,
    @Param('type') type: string,
    @Param('matchId') matchId: string,
  ) {
    console.log('🗳️ Creating quick poll - Full req.user object:', req.user);
    const userId = req.user?.userId;
    console.log('🗳️ Creating quick poll:', { userId, type, matchId });

    if (!userId) {
      console.error('❌ No user ID found in request');
      throw new Error('Authentication failed - no user ID');
    }

    try {
      const result = await this.pollsService.createQuickPoll(
        userId,
        matchId,
        type,
      );
      console.log('✅ Quick poll created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error creating quick poll:', error.message);
      throw error;
    }
  }

  @Post('vote')
  async vote(@Request() req, @Body() votePollDto: VotePollDto) {
    const userId = req.user?.userId;
    return this.pollsService.vote(userId, votePollDto);
  }

  @Get('results/:pollId')
  async getPollResults(@Param('pollId') pollId: number) {
    return this.pollsService.getPollResults(pollId);
  }

  @Get('match/:matchId')
  async getMatchPolls(@Param('matchId') matchId: string) {
    return this.pollsService.getMatchPolls(matchId);
  }

  @Get('my-polls')
  async getMyPolls(@Request() req) {
    const userId = req.user?.userId;
    return this.pollsService.getMyPolls(userId);
  }

  @Get('my-votes')
  async getMyVotes(@Request() req) {
    const userId = req.user?.userId;
    return this.pollsService.getMyVotes(userId);
  }
}
