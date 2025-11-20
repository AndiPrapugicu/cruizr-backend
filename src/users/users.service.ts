// src/users/users.service.ts

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';
import { Swipe } from '../swipes/swipe.entity';
import { Match } from '../matches/matches.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { StoreService } from '../store/store.service';
import { FuelService } from '../fuel/fuel.service';
import { CarsService } from '../cars/cars.service';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface BlockedUser {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Preferences {
  prefMinAge: number;
  prefMaxAge: number;
  prefDistance: number;
  prefCarBrand: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Swipe) private swipeRepo: Repository<Swipe>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @Inject(forwardRef(() => StoreService)) private storeService: StoreService,
    @Inject(forwardRef(() => FuelService)) private fuelService: FuelService,
    @Inject(forwardRef(() => CarsService)) private carsService: CarsService,
  ) {}

  async create(userData: Partial<User>) {
    const user = this.userRepo.create(userData);
    const savedUser = await this.userRepo.save(user);

    // Create wallet for the new user
    await this.fuelService.getOrCreateWallet(savedUser.id);

    return savedUser;
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['cars'],
    });
  }

  async findByName(name: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { name } });
  }

  async findAllExcept(userId: number): Promise<User[]> {
    return this.userRepo.find({
      where: { id: Not(userId) },
    });
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
    markOnboardingDone = false,
  ) {
    const updateData: any = { ...dto };
    if (markOnboardingDone) {
      updateData.onboardingCompleted = true;
    }
    await this.userRepo.update(userId, updateData);
    return this.findById(userId);
  }

  async completeOnboarding(userId: number, dto: any) {
    console.log('🎯 CompleteOnboarding called with:', { userId, dto });

    // Extract cars data and non-database fields from DTO
    const { cars, firstName, birthday, agreed, photos, ...userData } = dto;

    // Process photos - keep as Base64 strings (don't save to disk on Render)
    let savedPhotos: string[] = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      console.log(`📸 Processing ${photos.length} photos...`);
      savedPhotos = photos.filter((photo: string) => {
        return photo && (photo.startsWith('data:image') || photo.startsWith('http'));
      });
      console.log(`✅ Processed ${savedPhotos.length} photos`);
    }

    // Parse cars if it's a JSON string
    let carsData = cars;
    if (typeof cars === 'string') {
      try {
        carsData = JSON.parse(cars);
      } catch (error) {
        console.error('❌ Error parsing cars JSON:', error);
        carsData = [];
      }
    }

    // Process car photos - keep as Base64
    if (carsData && Array.isArray(carsData)) {
      carsData = carsData.map((car: any) => {
        if (car.photos && Array.isArray(car.photos)) {
          car.photos = car.photos.filter((photo: string) => {
            return photo && (photo.startsWith('data:image') || photo.startsWith('http'));
          });
        }
        return car;
      });
    }

    console.log('🚗 Cars data to save:', carsData);

    // Update user data with proper field mapping
    const userUpdateData = {
      ...userData,
      ...(firstName && { name: firstName }),
      ...(birthday && { birthdate: birthday }),
      ...(savedPhotos.length > 0 && { photos: savedPhotos }),
      ...(savedPhotos.length > 0 && { imageUrl: savedPhotos[0] }), // Set first photo as profile image
      onboardingCompleted: true,
    };

    console.log('📝 User update data:', userUpdateData);

    await this.userRepo.update(userId, userUpdateData);

    // Save cars if provided
    if (carsData && Array.isArray(carsData) && carsData.length > 0) {
      console.log('💾 Saving', carsData.length, 'cars for user', userId);

      for (const carData of carsData) {
        try {
          await this.carsService.create(userId, carData);
          console.log('✅ Car saved:', carData.brand, carData.model);
        } catch (error) {
          console.error('❌ Error saving car:', error);
        }
      }
    } else {
      console.log('⚠️ No cars data to save');
    }

    console.log('🎉 Onboarding completed for user', userId);
  }

  // ──────────────────────────────────────────────────────────────────
  // Returnează toate ID-urile blocate (atât cele pe care le-ai blocat,
  // cât și cele care te-au blocat pe tine).
  async getBlockedIds(userId: number): Promise<number[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['blockedUsers', 'blockedBy'],
    });
    if (!user) throw new BadRequestException('User not found');

    const blocked = user.blockedUsers?.map((u) => u.id) || [];
    const blockedBy = user.blockedBy?.map((u) => u.id) || [];
    return [...new Set([...blocked, ...blockedBy])];
  }

  // Răspunde cu lista completă de obiecte BlockedUser
  async getBlockedUsers(userId: number): Promise<BlockedUser[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });
    if (!user) throw new BadRequestException('User not found');

    return user.blockedUsers.map((u) => ({
      id: u.id,
      name: u.name,
      imageUrl: u.imageUrl,
    }));
  }

  async blockUser(userId: number, targetId: number) {
    if (userId === targetId) {
      throw new BadRequestException('You cannot block yourself');
    }
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });
    const target = await this.userRepo.findOne({ where: { id: targetId } });

    if (!user || !target) {
      throw new BadRequestException('User not found');
    }

    const alreadyBlocked = user.blockedUsers.some((u) => u.id === targetId);
    if (!alreadyBlocked) {
      user.blockedUsers.push(target);
      await this.userRepo.save(user);
    }
  }

  async unblockUser(userId: number, targetId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });
    if (!user) throw new BadRequestException('User not found');

    user.blockedUsers = user.blockedUsers.filter((u) => u.id !== targetId);
    await this.userRepo.save(user);
  }

  // ──────────────────────────────────────────────────────────────────
  // Notificări: GET + PATCH
  async getNotificationSettings(userId: number): Promise<NotificationSettings> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['emailNotifications', 'pushNotifications'],
    });
    if (!user) throw new BadRequestException('User not found');

    return {
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
    };
  }

  async updateNotificationSettings(
    userId: number,
    dto: NotificationSettings,
  ): Promise<NotificationSettings> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    user.emailNotifications = dto.emailNotifications;
    user.pushNotifications = dto.pushNotifications;
    await this.userRepo.save(user);

    return {
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // User Statistics: get match count, like count, and cars count
  async getUserStats(userId: number) {
    // Count matches where user is involved
    const matchCount = await this.matchRepo.count({
      where: [{ userA: { id: userId } }, { userB: { id: userId } }],
    });

    // Count likes received (swipes to the right on this user)
    const likeCount = await this.swipeRepo.count({
      where: {
        targetUserId: userId,
        direction: 'right',
      },
    });

    // Count user's cars
    const carsCount = await this.carsService.getUserCarsCount(userId);

    return {
      matches: matchCount,
      likes: likeCount,
      cars: carsCount,
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // Schimbă parola: verifică parola curentă și o înlocuiește cu noua parolă
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // compară parola curentă cu hash-ul stocat în DB
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      throw new UnauthorizedException('Parola curentă nu este corectă');
    }

    // hash noua parolă și salvează
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashed;
    await this.userRepo.save(user);
  }

  // ──────────────────────────────────────────────────────────────────
  // Găsește utilizatorii din apropiere (Haversine),
  // dar exclude:
  //   1) Pe tine însuți (currentUserId)
  //   2) Pe cei cu swipe recent (ultimele `days` zile)
  //   3) Pe cei blocați de tine sau care te-au blocat pe tine
  async findNearbyExcludingRecentSwipes(
    currentUserId: number,
    distanceKm: number,
    lat: number,
    lng: number,
    days: number,
  ) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Swipe-uri recente
    const recentSwipes = await this.swipeRepo.find({
      where: {
        user: { id: currentUserId },
        createdAt: Between(cutoff, new Date()),
      },
      select: ['targetUserId'],
    });
    const excludedIdsFromSwipes = recentSwipes.map((sw) => sw.targetUserId);

    // Utilizatori cu care deja avem match (în ambele direcții)
    // Folosim query-ul raw pentru a accesa direct coloanele userAId și userBId
    const existingMatches = await this.matchRepo
      .createQueryBuilder('match')
      .where('match.userAId = :userId', { userId: currentUserId })
      .orWhere('match.userBId = :userId', { userId: currentUserId })
      .getRawMany();

    const excludedIdsFromMatches = existingMatches.map((match) =>
      match.match_userAId === currentUserId
        ? match.match_userBId
        : match.match_userAId,
    );

    // Blocked IDs
    const blockedIds = await this.getBlockedIds(currentUserId);

    // Toate ID-urile pe care le excludem
    const allExcludedIds = [
      currentUserId,
      ...excludedIdsFromSwipes,
      ...excludedIdsFromMatches,
      ...blockedIds,
    ].filter((id) => id !== undefined);

    console.log(`📍 Finding nearby users for user ${currentUserId}`);
    console.log(
      `🚫 Excluded from swipes: [${excludedIdsFromSwipes.join(', ')}]`,
    );
    console.log(
      `💕 Excluded from matches: [${excludedIdsFromMatches.join(', ')}]`,
    );
    console.log(`🚫 Excluded from blocked: [${blockedIds.join(', ')}]`);
    console.log(`📋 Total excluded IDs: [${allExcludedIds.join(', ')}]`);

    // Ia preferința de gen a userului curent
    const currentUser = await this.userRepo.findOne({
      where: { id: currentUserId },
    });

    const allUsers = await this.userRepo.find({
      where: {
        id: Not(In(allExcludedIds as any)),
        latitude: Not(IsNull()),
        longitude: Not(IsNull()),
        ...(currentUser?.prefGender && currentUser.prefGender !== 'both'
          ? { gender: currentUser.prefGender }
          : {}),
      },
      select: [
        'id',
        'name',
        'age',
        'birthdate',
        'gender',
        'email',
        'latitude',
        'longitude',
        'carModel',
        'imageUrl',
        'city',
      ],
    });

    // Filtrare manuală pe distanță (formula Haversine) + adăugare distanță
    const toRad = (value: number) => (value * Math.PI) / 180;
    const haversine = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Calculează distanța și vârsta și le adaugă în rezultat
    const usersWithDistance = allUsers
      .map((user) => {
        const distance = haversine(lat, lng, user.latitude, user.longitude);

        // Calculează vârsta din birthdate dacă nu există age
        let calculatedAge = user.age;
        if (!calculatedAge && user.birthdate) {
          const today = new Date();
          const birthDate = new Date(user.birthdate);
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            calculatedAge--;
          }
        }

        return {
          ...user,
          age: calculatedAge,
          distance: Math.round(distance * 10) / 10, // rotunjește la 1 zecimală
        };
      })
      .filter((user) => user.distance <= distanceKm);

    // Apply Double Swipe Chance power-up: Check each user and potentially duplicate them
    let finalResults = [...usersWithDistance];

    for (const user of usersWithDistance) {
      const userPowerUps = await this.getUserActivePowerUps(user.id);

      // If user has Double Swipe Chance, add them again (higher chance to appear)
      if (userPowerUps.doubleSwipeChance) {
        console.log(
          `🔥 User ${user.id} (${user.name}) has Double Swipe Chance - increasing visibility!`,
        );
        // Add the user again to increase their chances of appearing
        finalResults.push(user);
      }
    }

    // Shuffle final results to mix doubled users naturally
    finalResults = finalResults.sort(() => Math.random() - 0.5);

    console.log(
      `📍 Found ${finalResults.length} results (${usersWithDistance.length} unique users) for user ${currentUserId}`,
    );
    return finalResults;
  }

  // ──────────────────────────────────────────────────────────────────
  // Calculează scorul de compatibilitate (0–100)
  calculateCompatibility(userA: User, userB: User): number {
    let score = 0;
    if (!userA.carModel || !userB.carModel) return 0;

    const modelA = userA.carModel.toLowerCase();
    const modelB = userB.carModel.toLowerCase();
    const brandA = modelA.split(' ')[0];
    const brandB = modelB.split(' ')[0];

    if (brandA === brandB) {
      score += 30;
    }

    const modsA = userA.carMods || [];
    const modsB = userB.carMods || [];
    const sharedMods = modsA.filter((m) => modsB.includes(m));
    score += sharedMods.length * 10;

    const intsA = userA.interests || [];
    const intsB = userB.interests || [];
    const sharedInterests = intsA.filter((i) => intsB.includes(i));
    score += sharedInterests.length * 5;

    return Math.min(score, 100);
  }

  // Get sau update preferințe
  async getPreferences(userId: number): Promise<Preferences> {
    console.log('Caut user cu id:', userId);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    console.log('Rezultat user:', user);
    if (!user) throw new BadRequestException('User not found');
    return {
      prefMinAge: user.prefMinAge ?? 18,
      prefMaxAge: user.prefMaxAge ?? 100,
      prefDistance: user.prefDistance ?? 20,
      prefCarBrand: user.prefCarBrand ?? '',
    };
  }

  async updatePreferences(
    userId: number,
    dto: Partial<Preferences>,
  ): Promise<Preferences> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Suprascriem doar câmpurile existente în dto
    if (dto.prefMinAge !== undefined) user.prefMinAge = dto.prefMinAge;
    if (dto.prefMaxAge !== undefined) user.prefMaxAge = dto.prefMaxAge;
    if (dto.prefDistance !== undefined) user.prefDistance = dto.prefDistance;
    if (dto.prefCarBrand !== undefined) user.prefCarBrand = dto.prefCarBrand;

    await this.userRepo.save(user);

    return {
      prefMinAge: user.prefMinAge!,
      prefMaxAge: user.prefMaxAge!,
      prefDistance: user.prefDistance!,
      prefCarBrand: user.prefCarBrand!,
    };
  }

  async findProfileById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'carModel',
        'imageUrl',
        'bio',
        'carMods',
        'interests',
        'age',
        'photos',
        'city',
        'birthdate',
        'isVip',
        'vipTitle',
        'vipExpiresAt',
      ],
      relations: ['cars'], // Add cars relation
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // Returnează lista de utilizatori + scor de compatibilitate
  async getCompatibleUsers(currentUserId: number) {
    const userA = await this.findById(currentUserId);
    if (!userA) {
      throw new BadRequestException('User not found');
    }

    const blockedIds = await this.getBlockedIds(currentUserId);

    const others = await this.userRepo.find({
      where: {
        id: Not(In([currentUserId, ...blockedIds] as any)),
      },
    });

    const results = others.map((userB) => ({
      user: userB,
      compatibility: this.calculateCompatibility(userA, userB),
    }));

    return results.sort((a, b) => b.compatibility - a.compatibility);
  }

  // ──────────────────────────────────────────────────────────────────
  // Check if user has active power-ups
  async getUserActivePowerUps(userId: number) {
    try {
      const activeItems = await this.storeService.getActiveItems(userId);

      const powerUps = {
        doubleSwipeChance: activeItems.some(
          (item) => item.itemId === 'double-swipe-chance',
        ),
        spotlight: activeItems.some(
          (item) => item.itemId === 'spotlight-30min',
        ),
        superLike: activeItems.some(
          (item) => item.itemId === 'super-like-5pack',
        ),
        reverseSwipe: activeItems.some(
          (item) => item.itemId === 'reverse-swipe',
        ),
        seeWhoLiked: activeItems.some(
          (item) => item.itemId === 'see-who-liked',
        ),
      };

      console.log(`🔥 User ${userId} power-ups:`, powerUps);
      return powerUps;
    } catch (error) {
      console.error('Error getting user power-ups:', error);
      return {
        doubleSwipeChance: false,
        spotlight: false,
        superLike: false,
        reverseSwipe: false,
        seeWhoLiked: false,
      };
    }
  }

  /**
   * Șterge un user împreună cu toate referințele lui
   * (swipe-uri, match-uri, relații de blocare).
   */
  async deleteUser(id: number): Promise<void> {
    // 1) elimină orice apariție a lui id din blocările altor utilizatori
    const usersWhoBlockedThis = await this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.blockedUsers', 'b')
      .where('b.id = :id', { id })
      .getMany();

    for (const u of usersWhoBlockedThis) {
      u.blockedUsers = u.blockedUsers.filter((b) => b.id !== id);
      await this.userRepo.save(u);
    }

    // 2) golește relația blockedUsers a lui id
    const me = await this.userRepo.findOne({
      where: { id },
      relations: ['blockedUsers'],
    });
    if (me) {
      me.blockedUsers = [];
      await this.userRepo.save(me);
    }

    // 3) șterge toate swipe-urile în care apare id (ca actor sau țintă)
    await this.swipeRepo.delete([
      { user: { id } } as any,
      { targetUser: { id } } as any,
    ]);

    // 4) șterge toate match-urile în care apare id (ca userA sau userB)
    await this.matchRepo.delete([
      { userA: { id } } as any,
      { userB: { id } } as any,
    ]);

    // 5) în final, șterge user-ul însuși
    await this.userRepo.delete(id);
  }

  // Returnează un preview basic pentru profilul propriu
  async getOwnProfilePreview(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: [
        'id',
        'name',
        'age',
        'imageUrl',
        'carModel',
        'carMods',
        'interests',
        'bio',
        'isVip',
        'vipTitle',
        'vipExpiresAt',
      ],
    });

    if (!user) throw new BadRequestException('User not found');

    return {
      id: user.id,
      name: user.name,
      age: user.age,
      imageUrl: user.imageUrl,
      carModel: user.carModel,
      carMods: user.carMods,
      interests: user.interests,
      bio: user.bio,
      isVip: user.isVip,
      vipTitle: user.vipTitle,
      vipExpiresAt: user.vipExpiresAt,
      compatibilityScore: 100, // mereu 100 pentru propriul profil
    };
  }

  // Returnează un preview pentru alt user + scor compatibilitate
  async getUserProfilePreview(currentUserId: number, targetUserId: number) {
    if (currentUserId === targetUserId) {
      return this.getOwnProfilePreview(currentUserId);
    }

    const [currentUser, targetUser] = await Promise.all([
      this.userRepo.findOne({
        where: { id: currentUserId },
        select: ['carModel', 'carMods', 'interests'],
      }),
      this.userRepo.findOne({
        where: { id: targetUserId },
        select: [
          'id',
          'name',
          'age',
          'imageUrl',
          'carModel',
          'carMods',
          'interests',
          'bio',
        ],
      }),
    ]);

    if (!targetUser) throw new BadRequestException('Target user not found');
    if (!currentUser) throw new BadRequestException('Current user not found');

    const score = this.calculateCompatibility(currentUser, targetUser);

    return {
      id: targetUser.id,
      name: targetUser.name,
      age: targetUser.age,
      imageUrl: targetUser.imageUrl,
      carModel: targetUser.carModel,
      carMods: targetUser.carMods,
      interests: targetUser.interests,
      bio: targetUser.bio,
      compatibilityScore: score,
    };
  }

  // async getUserProfilePreview(currentUserId: number, targetUserId: number) {
  //   if (currentUserId === targetUserId) {
  //     return this.getOwnProfilePreview(currentUserId);
  //   }

  //   const [currentUser, targetUser] = await Promise.all([
  //     this.userRepo.findOne({
  //       where: { id: currentUserId },
  //       select: ['carModel', 'carMods', 'interests'],
  //     }),
  //     this.userRepo.findOne({
  //       where: { id: targetUserId },
  //       select: [
  //         'id',
  //         'name',
  //         'age',
  //         'imageUrl',
  //         'carModel',
  //         'carMods',
  //         'interests',
  //         'bio',
  //       ],
  //     }),
  //   ]);

  //   if (!targetUser) throw new BadRequestException('Target user not found');
  //   if (!currentUser) throw new BadRequestException('Current user not found');

  //   const score = this.calculateCompatibility(currentUser, targetUser);

  //   return {
  //     id: targetUser.id,
  //     name: targetUser.name,
  //     age: targetUser.age,
  //     imageUrl: targetUser.imageUrl,
  //     carModel: targetUser.carModel,
  //     carMods: targetUser.carMods,
  //     interests: targetUser.interests,
  //     bio: targetUser.bio,
  //     compatibilityScore: score,
  //   };
  // }
}
