// src/users/users.controller.ts

import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  UsersService,
  NotificationSettings,
  BlockedUser,
  Preferences,
} from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
// import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ────────────────────────────────────────────────────────────
  // ▶︎ TEST VIP STATUS (temporarily without auth)
  // ────────────────────────────────────────────────────────────
  @Get('test-vip-status/:userId')
  async testVipStatus(@Param('userId', ParseIntPipe) userId: number) {
    const profile = await this.usersService.findProfileById(userId);
    return {
      userId,
      isVip: profile?.isVip || false,
      vipTitle: profile?.vipTitle || null,
      vipExpiresAt: profile?.vipExpiresAt || null,
      profileData: profile,
    };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Returnează profilul propriului user (fără parola)
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.usersService.findById(+req.user.userId);
    if (user) {
      const { password, email, ...rest } = user;
      return rest;
    }
    return null;
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Returnează statisticile utilizatorului (matches, likes, views)
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getMyStats(@Req() req) {
    return this.usersService.getUserStats(+req.user.userId);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Actualizează profilul propriu (carModel, imageUrl, city, etc.)
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req, @Body() dto: UpdateProfileDto) {
    await this.usersService.updateProfile(+req.user.userId, dto, true);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Încarcă o poză nouă pentru profil (upload pe disk, returnează URL)
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return { url: `/uploads/photos/${file.filename}` };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Încarcă multiple poze pentru profil (upload pe disk, adaugă la photos[])
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('upload-photos')
  @UseInterceptors(
    FilesInterceptor('photos', 6, {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
    }),
  )
  async uploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const userId = +req.user.userId;
    console.log(`📸 Uploading ${files.length} photos for user ${userId}`);

    // Get current user photos
    const user = await this.usersService.findById(userId);
    const currentPhotos = user?.photos || [];

    // Add new photo paths
    const newPhotoPaths = files.map((file) => `/uploads/photos/${file.filename}`);
    const allPhotos = [...currentPhotos, ...newPhotoPaths];

    // Update user with new photos
    await this.usersService.updateProfile(userId, {
      photos: allPhotos,
      imageUrl: allPhotos[0], // Keep first photo as profile image
    });

    console.log(`✅ Updated user ${userId} with ${allPhotos.length} total photos`);

    return {
      success: true,
      photos: allPhotos,
      newPhotos: newPhotoPaths,
    };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Găsește utilizatori din apropiere, excluzând swipe‐uri recent și blocări
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('nearby')
  async getNearby(
    @Req() req,
    @Query('distance') distance: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    const userId = +req.user.userId;
    const dist = Number(distance) || 20;
    const latitude = Number(lat);
    const longitude = Number(lng);

    return this.usersService.findNearbyExcludingRecentSwipes(
      userId,
      dist,
      latitude,
      longitude,
      7, // exclude swipe‐uri din ultimele 7 zile
    );
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ Returnează lista de compatibilități (compatibilitate + user)
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('compatible')
  async getCompatible(@Req() req) {
    const userId = +req.user.userId;
    return this.usersService.getCompatibleUsers(userId);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Blocare user
  //   → POST /users/:targetId/block
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(':targetId/block')
  async blockUser(@Req() req, @Param('targetId') targetId: string) {
    const userId = +req.user.userId;
    const target = Number(targetId);
    if (isNaN(target)) {
      throw new BadRequestException('targetId trebuie să fie un număr');
    }
    await this.usersService.blockUser(userId, target);
    return { message: `User ${target} blocat cu succes` };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Deblocare user
  //   → DELETE /users/:targetId/block
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Delete(':targetId/block')
  async unblockUser(@Req() req, @Param('targetId') targetId: string) {
    const userId = +req.user.userId;
    const target = Number(targetId);
    if (isNaN(target)) {
      throw new BadRequestException('targetId trebuie să fie un număr');
    }
    await this.usersService.unblockUser(userId, target);
    return { message: `User ${target} deblocat cu succes` };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Get profil după ID
  //   → GET /users/:id/profile
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(':id/profile')
  async getProfileById(@Param('id') id: number) {
    const user = await this.usersService.findProfileById(+id);
    if (!user) throw new NotFoundException('User not found');

    let birthdateIso: string | null = null;
    if (user.birthdate) {
      if (typeof user.birthdate === 'string') {
        birthdateIso = user.birthdate;
      } else if (user.birthdate instanceof Date) {
        birthdateIso = user.birthdate.toISOString().slice(0, 10);
      }
    }

    return {
      ...user,
      birthdate: birthdateIso,
    };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Get profil după username (pentru Chat)
  //   → GET /users/:username
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByName(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      avatarUrl: user.imageUrl,
      car: user.carModel,
    };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Get notificări
  //   → GET /users/me/notifications
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me/notifications')
  async getNotifications(@Req() req): Promise<NotificationSettings> {
    const userId = +req.user.userId;
    return this.usersService.getNotificationSettings(userId);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Update notificări
  //   → PATCH /users/me/notifications
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Patch('me/notifications')
  async updateNotifications(
    @Req() req,
    @Body() dto: NotificationSettings,
  ): Promise<NotificationSettings> {
    const userId = +req.user.userId;
    return this.usersService.updateNotificationSettings(userId, dto);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Get blocked users
  //   → GET /users/me/blocked
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me/blocked')
  async getBlocked(@Req() req): Promise<BlockedUser[]> {
    const userId = +req.user.userId;
    return this.usersService.getBlockedUsers(userId);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Delete current user
  //   → DELETE /users/:id
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteById(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
    @Req() req: any,
  ) {
    await this.usersService.deleteUser(id);
    return { message: `User ${id} șters cu succes.` };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Change password
  //   → POST /users/me/password
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('me/password')
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const userId = +req.user.userId;
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'currentPassword și newPassword sunt obligatorii',
      );
    }
    await this.usersService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
    return { message: 'Parola a fost schimbată cu succes.' };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Get Preferences
  //   → GET /users/me/preferences
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me/preferences')
  async getPreferences(@Req() req) {
    const userId = Number(req.user.userId);
    console.log('userId extras:', userId);
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user id in JWT');
    }
    const prefs = await this.usersService.getPreferences(userId);
    return prefs;
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Update Preferences
  //   → PATCH /users/me/preferences
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Patch('me/preferences')
  async updatePreferences(@Req() req, @Body() dto: Partial<Preferences>) {
    const userId = Number(req.user.userId);
    console.log('UPDATE PREFS', userId, dto);
    return this.usersService.updatePreferences(userId, dto);
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Complete onboarding
  //   → POST /users/onboarding
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('onboarding')
  async completeOnboarding(@Req() req, @Body() dto: any) {
    // Poți valida dto cu un DTO dedicat dacă vrei
    await this.usersService.completeOnboarding(+req.user.userId, dto);
    return { success: true };
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ NOU: Complete onboarding with registration
  //   → POST /users/onboarding-register
  // ────────────────────────────────────────────────────────────
  @Post('onboarding-register')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
    }),
  )
  async completeOnboardingWithRegistration(
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log(
        '🎯 [OnboardingRegister] Starting registration+onboarding for:',
        dto.firstName,
      );
      console.log('📸 [OnboardingRegister] Received', files?.length || 0, 'total files');

      // Separate user photos from car photos
      const userPhotos = files.filter(f => f.fieldname === 'photos');
      const carPhotosByIndex: { [key: string]: Express.Multer.File[] } = {};
      
      files.forEach(f => {
        if (f.fieldname.startsWith('carPhotos_')) {
          const carIndex = f.fieldname.split('_')[1];
          if (!carPhotosByIndex[carIndex]) {
            carPhotosByIndex[carIndex] = [];
          }
          carPhotosByIndex[carIndex].push(f);
        }
      });

      console.log('📸 User photos:', userPhotos.length);
      console.log('🚗 Car photos by index:', Object.keys(carPhotosByIndex).map(idx => `Car ${idx}: ${carPhotosByIndex[idx].length} photos`));

      // Create user account
      const hash = await require('bcrypt').hash('password123', 10); // Temporary password
      const userData = {
        name: dto.firstName,
        email: `${dto.firstName.toLowerCase()}${Date.now()}@carmatch.temp`,
        password: hash,
      };

      const user = await this.usersService.create(userData);
      console.log('✅ [OnboardingRegister] User created:', user.id);

      // Add uploaded file paths to DTO
      const onboardingData = {
        ...dto,
        uploadedPhotos: userPhotos || [],
        carPhotosByIndex: carPhotosByIndex,
        interests: dto.interests ? JSON.parse(dto.interests) : [],
      };

      // Complete onboarding
      await this.usersService.completeOnboarding(user.id, onboardingData);
      console.log('✅ [OnboardingRegister] Onboarding completed');

      // Generate token
      const jwt = require('jsonwebtoken');
      const payload = { sub: user.id, email: user.email };
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const access_token = jwt.sign(payload, secret, { expiresIn: '7d' });

      return {
        success: true,
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('❌ [OnboardingRegister] Error:', error.message);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────
  // ▶︎ TEMP: Reset user photos (remove old file paths)
  //   → POST /users/reset-photos
  // ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('reset-photos')
  async resetPhotos(@Req() req) {
    const userId = +req.user.userId;
    await this.usersService.updateProfile(userId, {
      photos: [],
      imageUrl: undefined,
    });
    return { message: 'Photos reset successfully. You can now upload new Base64 photos.' };
  }
}
