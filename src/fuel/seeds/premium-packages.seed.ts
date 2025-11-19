import { DataSource } from 'typeorm';
import { PremiumPackage } from '../entities/premium-package.entity';

export const seedPremiumPackages = async (dataSource: DataSource) => {
  const premiumPackageRepository = dataSource.getRepository(PremiumPackage);

  // Clear existing packages
  await premiumPackageRepository.clear();

  const packages = [
    // Starter Packs
    {
      name: 'Starter Pack',
      premiumPoints: 100,
      priceUSD: 0.99,
      priceEUR: 0.89,
      priceRON: 4.99,
      originalPriceUSD: 1.29,
      originalPriceEUR: 1.19,
      originalPriceRON: 6.49,
      discountPercent: 23,
      category: 'starter',
      description: 'Perfect for beginners - get started with premium features!',
      features: ['100 Premium Points', 'Instant delivery', 'No expiration'],
      isPopular: false,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-12-31'),
    },

    // Popular Pack
    {
      name: 'Popular Pack',
      premiumPoints: 500,
      priceUSD: 4.99,
      priceEUR: 4.49,
      priceRON: 24.99,
      originalPriceUSD: 6.49,
      originalPriceEUR: 5.99,
      originalPriceRON: 32.99,
      discountPercent: 23,
      category: 'popular',
      description: 'Most popular choice - great value for money!',
      features: [
        '500 Premium Points',
        'Best value deal',
        'Instant delivery',
        'Bonus rewards',
      ],
      isPopular: true,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-12-31'),
    },

    // Premium Pack
    {
      name: 'Premium Pack',
      premiumPoints: 1000,
      priceUSD: 9.99,
      priceEUR: 8.99,
      priceRON: 49.99,
      originalPriceUSD: 12.99,
      originalPriceEUR: 11.99,
      originalPriceRON: 64.99,
      discountPercent: 23,
      category: 'premium',
      description: 'Premium experience with exclusive benefits!',
      features: [
        '1000 Premium Points',
        'Exclusive features',
        'Priority support',
        'Special rewards',
      ],
      isPopular: false,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-12-31'),
    },

    // Mega Pack
    {
      name: 'Mega Pack',
      premiumPoints: 2500,
      priceUSD: 24.99,
      priceEUR: 22.99,
      priceRON: 124.99,
      originalPriceUSD: 32.49,
      originalPriceEUR: 29.99,
      originalPriceRON: 162.49,
      discountPercent: 23,
      category: 'mega',
      description: 'Ultimate package for power users!',
      features: [
        '2500 Premium Points',
        'Maximum value',
        'VIP treatment',
        'Exclusive content',
        'Extended benefits',
      ],
      isPopular: false,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-12-31'),
    },

    // Holiday Special
    {
      name: 'Holiday Special',
      premiumPoints: 1500,
      priceUSD: 14.99,
      priceEUR: 13.49,
      priceRON: 74.99,
      originalPriceUSD: 19.99,
      originalPriceEUR: 17.99,
      originalPriceRON: 99.99,
      discountPercent: 25,
      category: 'special',
      description: "Limited time holiday offer - don't miss out!",
      features: [
        '1500 Premium Points',
        'Holiday bonus',
        'Limited time only',
        'Special rewards',
        'Festive features',
      ],
      isPopular: false,
      isActive: true,
      validFrom: new Date('2024-12-01'),
      validTo: new Date('2025-01-31'),
    },
  ];

  for (const packageData of packages) {
    const premiumPackage = premiumPackageRepository.create(packageData);
    await premiumPackageRepository.save(premiumPackage);
  }

  console.log('Premium packages seeded successfully!');
};
