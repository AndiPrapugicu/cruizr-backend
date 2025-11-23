// src/matches/matches.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Match } from './matches.entity';
import { User } from '../users/users.entity';
import { Swipe } from '../swipes/swipe.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppGateway } from 'src/app.gateway';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Swipe) private swipeRepo: Repository<Swipe>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private appGateway: AppGateway,
  ) {}

  async create(userAId: number, userBId: number) {
    const [userA, userB] = await this.loadUsers(userAId, userBId);

    const match = this.matchRepo.create({
      userA,
      userB,
      status: 'pending',
    });
    return this.matchRepo.save(match);
  }

  findForUser(userId: number) {
    return this.matchRepo.find({
      where: [{ userA: { id: userId } }, { userB: { id: userId } }],
      relations: ['userA', 'userB'],
    });
  }

  updateStatus(id: number, status: 'accepted' | 'rejected') {
    return this.matchRepo.update(id, { status });
  }

  async getReceivedLikes(userId: number) {
    const likes = await this.matchRepo.find({
      where: { userB: { id: userId }, status: 'pending' },
      relations: ['userA'],
    });

    return likes.map((like) => ({
      id: like.userA.id,
      name: like.userA.name,
      carModel: like.userA.carModel,
      imageUrl: like.userA.imageUrl,
    }));
  }

  async getReceivedSuperLikes(userId: number) {
    // Get all pending matches for this user
    const pendingMatches = await this.matchRepo.find({
      where: { userB: { id: userId }, status: 'pending' },
      relations: ['userA'],
    });

    // For now, return all pending matches as potential Super Likes
    // In a real implementation, we would store Super Like metadata
    return pendingMatches.map((match) => ({
      id: match.userA.id,
      name: match.userA.name,
      carModel: match.userA.carModel,
      imageUrl: match.userA.imageUrl,
      type: 'super_like',
      matchId: match.id,
      message: `${match.userA.name} ți-a trimis un Super Like! ⭐`,
      receivedAt: match.userA.createdAt,
    }));
  }

  async getRecentMatches(userId: number) {
    // Get recent accepted matches (within last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentMatches = await this.matchRepo.find({
      where: [
        { userA: { id: userId }, status: 'accepted' },
        { userB: { id: userId }, status: 'accepted' },
      ],
      relations: ['userA', 'userB'],
      order: { id: 'DESC' },
      take: 10,
    });

    return recentMatches.map((match) => {
      const otherUser = match.userA.id === userId ? match.userB : match.userA;
      return {
        id: otherUser.id,
        name: otherUser.name,
        carModel: otherUser.carModel,
        imageUrl: otherUser.imageUrl,
        matchId: match.id,
        matchedAt: match.updatedAt || new Date(),
      };
    });
  }

  async swipe(
    fromUserId: number,
    toUserId: number,
    direction: 'right' | 'left' | 'up',
  ) {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Nu poți da swipe la tine însuți.');
    }

    // ──────────── Verificăm blocarea ────────────
    const blockedIds = await this.usersService.getBlockedIds(fromUserId);
    if (blockedIds.includes(toUserId)) {
      throw new BadRequestException(
        'Nu poți da swipe acestui user (a fost blocat).',
      );
    }
    // ────────────────────────────────────────────

    // Verificăm dacă a existat un swipe recent
    const existingSwipe = await this.checkRecentSwipe(fromUserId, toUserId);
    if (existingSwipe) {
      return { skipped: true, swipe: existingSwipe };
    }

    // Încărcăm entitățile User pentru fromUser și toUser
    const fromUser = await this.userRepo.findOne({ where: { id: fromUserId } });
    if (!fromUser) {
      throw new BadRequestException('Utilizatorul curent nu există');
    }
    const toUser = await this.userRepo.findOne({ where: { id: toUserId } });
    if (!toUser) {
      throw new BadRequestException('Utilizatorul țintă nu există');
    }

    // Creăm un obiect Swipe nou
    const swipeEntity = this.swipeRepo.create({
      user: fromUser,
      targetUser: toUser,
      direction,
    });
    await this.swipeRepo.save(swipeEntity);

    if (direction === 'right' || direction === 'up') {
      return this.handleRightSwipe(fromUserId, toUserId);
    } else {
      return this.handleLeftSwipe(fromUserId, toUserId);
    }
  }

  async respondToMatch(
    userId: number,
    matchId: number,
    response: 'accept' | 'reject',
  ) {
    console.log('🔄 Responding to match:', { userId, matchId, response });

    // Găsim match-ul
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['userA', 'userB'],
    });

    if (!match) {
      throw new BadRequestException('Match-ul nu a fost găsit');
    }

    // Verificăm că utilizatorul este recipient-ul (userB)
    if (match.userB.id !== userId) {
      throw new BadRequestException(
        'Nu ești autorizat să răspunzi la acest match',
      );
    }

    // Verificăm că match-ul este încă pending
    if (match.status !== 'pending') {
      throw new BadRequestException('Match-ul nu mai este pending');
    }

    // Actualizăm statusul match-ului
    if (response === 'accept') {
      match.status = 'accepted';
      await this.matchRepo.save(match);

      // Trimitem notificare de match către userA
      this.appGateway.server.to(`user_${match.userA.id}`).emit('notify_match', {
        withUser: match.userB.name,
        matchId: match.id,
      });

      console.log('✅ Match accepted:', match);
      return { match: true, matchData: match };
    } else {
      match.status = 'rejected';
      await this.matchRepo.save(match);

      console.log('❌ Match rejected:', match);
      return { match: false, matchData: match };
    }
  }

  /**
   * Returnează lista de match-uri accepted pentru userId,
   * excluzând partenerii blocați (sau care l-au blocat).
   */
  async getMatchesForUser(userId: number) {
    // 1) Obținem blocked IDs
    const blockedIds = await this.usersService.getBlockedIds(userId);

    // 2) Preluăm toate match-urile accepted care îl implică pe userId
    const matches = await this.matchRepo.find({
      where: [
        { userA: { id: userId }, status: 'accepted' },
        { userB: { id: userId }, status: 'accepted' },
      ],
      relations: ['userA', 'userB'],
    });

    // 3) Filtrăm match-urile în care partenerul nu e în blockedIds
    const filtered = matches.filter((m) => {
      const otherUser: User = m.userA.id === userId ? m.userB : m.userA;
      return !blockedIds.includes(otherUser.id);
    });

    // 4) Returnăm structura { matchId, user }
    return filtered.map((m) => ({
      matchId: m.id,
      user: m.userA.id === userId ? m.userB : m.userA,
    }));
  }

  // === Nou: metoda pentru controller-ul "GET /matches/me" ===
  async getSwipesByUser(userId: number) {
    return this.swipeRepo.find({
      where: { user: { id: userId } },
      select: ['targetUserId'],
    });
  }

  /**
   * Marchează un match ca raportat/„blocked”:
   * - Verifică că match-ul cu matchId există
   * - Verifică că utilizatorul curent face parte din acel match
   * - Apelează UsersService.blockUser() pentru partener
   * - Marchează match-ul ca „rejected” ca să dispară din listă
   */
  async reportMatch(matchId: number, reporterUserId: number): Promise<void> {
    // 1) Găsește match-ul
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['userA', 'userB'],
    });
    if (!match) {
      throw new NotFoundException('Match nu există');
    }

    // 2) Verifică dacă reporterUserId e userA sau userB
    const isParticipant =
      match.userA.id === reporterUserId || match.userB.id === reporterUserId;
    if (!isParticipant) {
      throw new ForbiddenException('Nu ai voie să raportezi acest match');
    }

    // 3) Determină ID-ul partenerului
    const otherUserId =
      match.userA.id === reporterUserId ? match.userB.id : match.userA.id;

    // 4) Blochează partenerul
    await this.usersService.blockUser(reporterUserId, otherUserId);

    // 5) Marchează match-ul ca „rejected”
    match.status = 'rejected';
    await this.matchRepo.save(match);
  }

  // === HELPER METHODS ===

  private async loadUsers(
    userAId: number,
    userBId: number,
  ): Promise<[User, User]> {
    const [userA, userB] = await Promise.all([
      this.userRepo.findOne({ where: { id: userAId } }),
      this.userRepo.findOne({ where: { id: userBId } }),
    ]);
    if (!userA || !userB) throw new BadRequestException('User not found');
    return [userA, userB];
  }

  public async checkRecentSwipe(fromUserId: number, toUserId: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    return this.swipeRepo.findOne({
      where: {
        userId: fromUserId,
        targetUserId: toUserId,
        createdAt: Between(cutoff, new Date()),
      },
    });
  }

  private async handleRightSwipe(fromUserId: number, toUserId: number) {
    const inverseMatch = await this.matchRepo.findOne({
      where: [
        { userA: { id: toUserId }, userB: { id: fromUserId } },
        { userA: { id: fromUserId }, userB: { id: toUserId } },
      ],
    });

    if (inverseMatch) {
      if (inverseMatch.status === 'pending') {
        inverseMatch.status = 'accepted';
        await this.matchRepo.save(inverseMatch);

        // Determină cine a dat like-back (Y) și cine a dat primul like (X)
        const likeBackUserId = fromUserId; // Y (cel care dă like-back acum)
        const firstLikeUserId = toUserId; // X (cel care a dat primul like)

        // === NOTIFICARE MATCH către ambii ===
        await this.notificationsService.notifyNewMatch(
          firstLikeUserId,
          likeBackUserId,
          inverseMatch.id,
        );

        this.appGateway.server
          .to(`user_${firstLikeUserId}`)
          .emit('notify_match', {
            withUser:
              inverseMatch.userA.id === firstLikeUserId
                ? inverseMatch.userB.name
                : inverseMatch.userA.name,
            matchId: inverseMatch.id,
          });

        return { match: true, newMatch: inverseMatch };
      } else if (inverseMatch.status === 'accepted') {
        return { match: true, newMatch: inverseMatch };
      } else if (inverseMatch.status === 'rejected') {
        const [userA, userB] = await this.loadUsers(fromUserId, toUserId);
        const newMatch = this.matchRepo.create({
          userA,
          userB,
          status: 'pending',
        });
        await this.matchRepo.save(newMatch);
        
        // Notificare de like către toUserId
        await this.notificationsService.notifyNewLike(toUserId, fromUserId);
        
        return { match: false, newMatch };
      }
    } else {
      const [userA, userB] = await this.loadUsers(fromUserId, toUserId);
      const newMatch = this.matchRepo.create({
        userA,
        userB,
        status: 'pending',
      });
      await this.matchRepo.save(newMatch);

      // === NOTIFICARE LIKE ===
      // Trimite notificare doar către userB (cel care a primit like-ul)
      await this.notificationsService.notifyNewLike(toUserId, fromUserId);
      
      this.appGateway.server.to(`user_${userB.id}`).emit('notify_like', {
        fromUser: userA.name,
        userId: userA.id,
      });

      return { match: false, newMatch };
    }
  }

  private async handleLeftSwipe(fromUserId: number, toUserId: number) {
    const inverseMatch = await this.matchRepo.findOne({
      where: [
        { userA: { id: toUserId }, userB: { id: fromUserId } },
        { userA: { id: fromUserId }, userB: { id: toUserId } },
      ],
    });

    if (inverseMatch && inverseMatch.status === 'pending') {
      inverseMatch.status = 'rejected';
      await this.matchRepo.save(inverseMatch);
      return { match: false, newMatch: inverseMatch };
    } else {
      return { match: false };
    }
  }
}
