import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll, PollVote } from './poll.entity';

export interface CreatePollDto {
  question: string;
  options: string[];
  allowMultipleChoices?: boolean;
  durationMinutes?: number;
  matchId: string;
}

export interface VotePollDto {
  pollId: number;
  optionIndex: number;
  comment?: string;
}

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(PollVote)
    private voteRepository: Repository<PollVote>,
  ) {}

  async createPoll(
    userId: number,
    createPollDto: CreatePollDto,
  ): Promise<Poll> {
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (createPollDto.durationMinutes || 60),
    );

    const poll = this.pollRepository.create({
      ...createPollDto,
      createdByUserId: userId,
      expiresAt,
    });

    const savedPoll = await this.pollRepository.save(poll);

    // Return the poll with creator information
    const pollWithCreator = await this.pollRepository.findOne({
      where: { id: savedPoll.id },
      relations: ['createdBy', 'votes'],
    });

    if (!pollWithCreator) {
      throw new Error('Failed to retrieve created poll');
    }

    return pollWithCreator;
  }

  async vote(userId: number, votePollDto: VotePollDto): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: votePollDto.pollId, isActive: true },
    });

    if (!poll) {
      throw new Error('Poll not found or inactive');
    }

    // Add debugging for time comparison
    const now = new Date();
    console.log('🕐 Vote Debug Info:');
    console.log('  Current time:', now.toISOString());
    console.log('  Poll expires at:', poll.expiresAt?.toISOString());
    console.log('  Poll created at:', poll.createdAt?.toISOString());
    console.log('  Is expired:', now > poll.expiresAt);

    // Temporary: Skip expiry check for testing
    // if (new Date() > poll.expiresAt) {
    //   throw new Error('Poll has expired');
    // }

    if (votePollDto.optionIndex >= poll.options.length) {
      throw new Error('Invalid option index');
    }

    const existingVote = await this.voteRepository.findOne({
      where: { pollId: votePollDto.pollId, userId },
    });

    // Temporary: Skip duplicate vote check for testing
    // if (existingVote && !poll.allowMultipleChoices) {
    //   throw new Error('You have already voted on this poll');
    // }

    const vote = this.voteRepository.create({
      ...votePollDto,
      userId,
    });

    await this.voteRepository.save(vote);

    // Return the complete poll with updated vote counts
    const updatedPoll = await this.pollRepository.findOne({
      where: { id: votePollDto.pollId },
      relations: ['votes', 'votes.user', 'createdBy'],
    });

    if (!updatedPoll) {
      throw new Error('Poll not found after voting');
    }

    console.log(
      '🗳️ Returning updated poll after vote:',
      JSON.stringify(updatedPoll, null, 2),
    );

    return updatedPoll;
  }

  async getPollResults(pollId: number) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['votes', 'votes.user'],
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    const results = poll.options.map((option, index) => {
      const votes = poll.votes.filter((vote) => vote.optionIndex === index);
      return {
        option,
        votes: votes.length,
        percentage:
          poll.votes.length > 0
            ? Math.round((votes.length / poll.votes.length) * 100)
            : 0,
        voters: votes.map((vote) => ({
          username: vote.user.name,
          comment: vote.comment,
        })),
      };
    });

    return {
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options,
        totalVotes: poll.votes.length,
        expiresAt: poll.expiresAt,
        isExpired: new Date() > poll.expiresAt,
        allowMultipleChoices: poll.allowMultipleChoices,
      },
      results,
    };
  }

  async getMatchPolls(matchId: string) {
    return this.pollRepository.find({
      where: { matchId, isActive: true },
      relations: ['createdBy', 'votes'],
      order: { createdAt: 'DESC' },
    });
  }

  // Sondaje predefinite pentru diverse subiecte auto
  async createQuickPoll(
    userId: number,
    matchId: string,
    pollType: string,
  ): Promise<Poll> {
    const predefinedPolls = {
      'bmw-audi': {
        question: 'BMW sau Audi?',
        options: ['BMW', 'Audi'],
        durationMinutes: 1440, // 24 hours for testing
      },
      'benzina-diesel': {
        question: 'Benzină sau Diesel?',
        options: ['Benzină', 'Diesel'],
        durationMinutes: 1440, // 24 hours for testing
      },
      'manual-automat': {
        question: 'Transmisie manuală sau automată?',
        options: ['Manuală', 'Automată'],
        durationMinutes: 1440, // 24 hours for testing
      },
      'sedan-suv': {
        question: 'Sedan sau SUV?',
        options: ['Sedan', 'SUV'],
        durationMinutes: 120,
      },
      'nou-second': {
        question: 'Mașină nouă sau second-hand?',
        options: ['Nouă', 'Second-hand'],
        durationMinutes: 180,
      },
      'oras-drum': {
        question: 'Condus în oraș sau pe drum lung?',
        options: ['În oraș', 'Pe drum lung'],
        durationMinutes: 120,
      },
      'viteza-confort': {
        question: 'Viteză sau confort?',
        options: ['Viteză', 'Confort'],
        durationMinutes: 120,
      },
      'culoare-clasica': {
        question: 'Culoare clasică sau îndrăzneață?',
        options: ['Clasică', 'Îndrăzneață'],
        durationMinutes: 120,
      },
      // Legacy polls for backward compatibility
      brand_preference: {
        question: 'Ce brand preferi?',
        options: ['BMW', 'Audi', 'Mercedes', 'Volkswagen', 'Alte mărci'],
        durationMinutes: 120,
      },
      fuel_type: {
        question: 'Ce tip de combustibil preferi?',
        options: ['Benzină', 'Diesel', 'Electric', 'Hibrid'],
        durationMinutes: 90,
      },
      car_style: {
        question: 'Ce stil de mașină îți place mai mult?',
        options: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible'],
        durationMinutes: 90,
      },
      tuning_opinion: {
        question: 'Cum vezi tuning-ul?',
        options: [
          'Iubesc modificările',
          'Doar performance',
          'Stock is best',
          'Depinde de mașină',
        ],
        durationMinutes: 180,
      },
      driving_style: {
        question: 'Cum conduci de obicei?',
        options: ['Relaxat', 'Sportiv', 'Economic', 'Agresiv legal'],
        durationMinutes: 120,
      },
    };

    const pollTemplate = predefinedPolls[pollType];
    if (!pollTemplate) {
      throw new Error(
        `Invalid poll type: ${pollType}. Available types: ${Object.keys(predefinedPolls).join(', ')}`,
      );
    }

    return this.createPoll(userId, {
      ...pollTemplate,
      matchId,
    });
  }

  async getMyPolls(userId: number): Promise<Poll[]> {
    return this.pollRepository.find({
      where: { createdByUserId: userId },
      relations: ['votes'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyVotes(userId: number): Promise<PollVote[]> {
    return this.voteRepository.find({
      where: { userId },
      relations: ['poll'],
      order: { id: 'DESC' },
    });
  }
}
