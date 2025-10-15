import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StoreService } from '../store/store.service';
import { CreateStoreItemDto } from '../store/dto/store.dto';

async function seedStoreItems() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const storeService = app.get(StoreService);

  const storeItems: CreateStoreItemDto[] = [
    // Frontend Expected Items - Fuel Store
    {
      itemId: 'spotlight-30min',
      name: 'Spotlight',
      description: 'Apari primul în swipe-uri locale timp de 30 min',
      icon: '🔥',
      price: 25,
      currency: 'fuel',
      category: 'visibility-boosts',
      duration: 0.5, // 30 minutes
      metadata: { rarity: 'common', color: '#ff4757', animation: 'pulse' },
      effects: { boostMultiplier: 3, duration: 30, type: 'visibility' },
    },
    {
      itemId: 'double-swipe-chance',
      name: 'Double Swipe Chance',
      description: 'Apari de două ori unei persoane',
      icon: '🎲',
      price: 15,
      currency: 'fuel',
      category: 'visibility-boosts',
      maxUses: 5,
      metadata: { rarity: 'common', color: '#3742fa' },
      effects: { boostMultiplier: 2, type: 'matching' },
    },
    {
      itemId: 'highlight-profile',
      name: 'Highlight Profile',
      description: 'Contur colorat animat timp de 24h',
      icon: '✨',
      price: 20,
      currency: 'fuel',
      category: 'visibility-boosts',
      duration: 24,
      metadata: { rarity: 'common', color: '#ffa502', animation: 'glow' },
      effects: { duration: 24, type: 'profile' },
    },
    {
      itemId: 'fuel-streak-bonus',
      name: 'Fuel Streak Bonus',
      description: 'Bonus extra dacă ești activ zilnic',
      icon: '🔥',
      price: 30,
      currency: 'fuel',
      category: 'visibility-boosts',
      duration: 168, // 7 days
      metadata: { rarity: 'rare', color: '#ff6348' },
      effects: { boostMultiplier: 1.5, duration: 168, type: 'visibility' },
    },

    // Existing Items
    // Fuel Store Items
    // Profile Boosts
    {
      itemId: 'profile-boost-1h',
      name: 'Profile Boost (1h)',
      description: 'Make your profile 3x more visible for 1 hour',
      icon: '🚀',
      price: 50,
      currency: 'fuel',
      category: 'profile-boosts',
      duration: 1,
      metadata: { rarity: 'common' },
      effects: { boostMultiplier: 3, type: 'visibility' },
    },
    {
      itemId: 'profile-boost-6h',
      name: 'Profile Boost (6h)',
      description: 'Make your profile 3x more visible for 6 hours',
      icon: '🚀',
      price: 250,
      currency: 'fuel',
      category: 'profile-boosts',
      duration: 6,
      metadata: { rarity: 'rare' },
      effects: { boostMultiplier: 3, type: 'visibility' },
    },
    {
      itemId: 'super-boost-1h',
      name: 'Super Boost (1h)',
      description: 'Make your profile 10x more visible for 1 hour',
      icon: '⚡',
      price: 100,
      currency: 'fuel',
      category: 'profile-boosts',
      duration: 1,
      metadata: { rarity: 'epic' },
      effects: { boostMultiplier: 10, type: 'visibility' },
    },

    // Matching Tools
    {
      itemId: 'reverse-swipe',
      name: 'Reverse Swipe',
      description: 'Undo your last swipe',
      icon: '↩️',
      price: 20,
      currency: 'fuel',
      category: 'matching-tools',
      maxUses: 1,
      metadata: { rarity: 'common' },
      effects: { type: 'matching' },
    },
    {
      itemId: 'see-who-liked',
      name: 'See Who Liked Me',
      description: 'View people who already liked your profile',
      icon: '👀',
      price: 75,
      currency: 'fuel',
      category: 'matching-tools',
      maxUses: 1,
      metadata: { rarity: 'rare' },
      effects: { type: 'matching' },
    },
    {
      itemId: 'super-like-5pack',
      name: 'Super Likes (5 pack)',
      description: 'Get 5 Super Likes to stand out',
      icon: '⭐',
      price: 30,
      currency: 'fuel',
      category: 'matching-tools',
      maxUses: 5,
      metadata: { rarity: 'common' },
      effects: { type: 'matching' },
    },

    // Premium Store Items
    // Exclusive Access
    {
      itemId: 'premium-membership-1month',
      name: 'Premium Membership (1 Month)',
      description: 'Unlock all premium features for 1 month',
      icon: '💎',
      price: 10,
      currency: 'premium',
      category: 'exclusive-access',
      duration: 720, // 30 days * 24 hours
      metadata: { rarity: 'legendary' },
      effects: { type: 'access' },
    },
    {
      itemId: 'vip-status-7days',
      name: 'VIP Status (7 days)',
      description: 'Get VIP treatment and exclusive features',
      icon: '👑',
      price: 5,
      currency: 'premium',
      category: 'exclusive-access',
      duration: 168, // 7 days * 24 hours
      metadata: { rarity: 'epic' },
      effects: { type: 'access' },
    },

    // Profile Customization
    {
      itemId: 'animated-profile-frame',
      name: 'Animated Profile Frame',
      description: 'Add a special animated frame to your profile',
      icon: '🎨',
      price: 3,
      currency: 'premium',
      category: 'profile-customization',
      isPermanent: true,
      metadata: { rarity: 'rare', animation: 'glow' },
      effects: { type: 'profile' },
    },
    {
      itemId: 'custom-bio-effects',
      name: 'Custom Bio Effects',
      description: 'Add special effects to your bio text',
      icon: '✨',
      price: 2,
      currency: 'premium',
      category: 'profile-customization',
      isPermanent: true,
      metadata: { rarity: 'common' },
      effects: { type: 'profile' },
    },

    // Advanced Features
    {
      itemId: 'unlimited-swipes-24h',
      name: 'Unlimited Swipes (24h)',
      description: 'Swipe as much as you want for 24 hours',
      icon: '∞',
      price: 4,
      currency: 'premium',
      category: 'advanced-features',
      duration: 24,
      metadata: { rarity: 'rare' },
      effects: { type: 'matching' },
    },
    {
      itemId: 'passport-travel',
      name: 'Passport Travel',
      description: 'Change your location to anywhere in the world',
      icon: '🌍',
      price: 8,
      currency: 'premium',
      category: 'advanced-features',
      duration: 168, // 7 days
      metadata: { rarity: 'epic' },
      effects: { type: 'matching' },
    },
    {
      itemId: 'read-receipts',
      name: 'Read Receipts',
      description: 'See when matches read your messages',
      icon: '✓',
      price: 3,
      currency: 'premium',
      category: 'advanced-features',
      duration: 720, // 30 days
      metadata: { rarity: 'rare' },
      effects: { type: 'social' },
    },

    // Special Offers
    {
      itemId: 'monthly-boost-pack',
      name: 'Monthly Boost Pack',
      description: 'Get 10 profile boosts to use throughout the month',
      icon: '📦',
      price: 15,
      currency: 'premium',
      category: 'special-offers',
      maxUses: 10,
      metadata: { rarity: 'legendary' },
      effects: { type: 'visibility' },
    },
  ];

  console.log('Seeding store items...');

  for (const item of storeItems) {
    try {
      await storeService.createStoreItem(item);
      console.log(`✅ Created: ${item.name}`);
    } catch (error) {
      console.log(
        `❌ Error creating ${item.name}: ${(error as Error).message}`,
      );
    }
  }

  console.log('Store seeding completed!');
  await app.close();
}

seedStoreItems().catch(console.error);
