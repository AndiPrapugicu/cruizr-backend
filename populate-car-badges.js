require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

const carBadges = [
  // 🚗 CAR COLLECTION BADGES
  {
    key: 'first_ride',
    name: 'First Ride',
    description: 'Added your first car to the garage',
    icon: '🚗',
    color: '#10B981',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'car_collector',
    name: 'Collector',
    description: 'Own 3 or more cars',
    icon: '🏆',
    color: '#F59E0B',
    isRare: false,
    isActive: true,
    requiredCount: 3,
  },
  {
    key: 'modification_master',
    name: 'Mod Master',
    description: 'Added 5+ modifications to a car',
    icon: '🔧',
    color: '#8B5CF6',
    isRare: false,
    isActive: true,
    requiredCount: 5,
  },
  
  // ⚡ PERFORMANCE BADGES
  {
    key: 'speed_demon',
    name: 'Speed Demon',
    description: 'Own a car with 300+ horsepower',
    icon: '⚡',
    color: '#EF4444',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'horsepower_king',
    name: 'Horsepower King',
    description: 'Own a car with 500+ horsepower',
    icon: '👑',
    color: '#DC2626',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'turbo_enthusiast',
    name: 'Turbo Enthusiast',
    description: 'Own a turbocharged vehicle',
    icon: '🌪️',
    color: '#3B82F6',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🏁 RACING & TUNING BADGES
  {
    key: 'track_warrior',
    name: 'Track Warrior',
    description: 'Own a car built for the track',
    icon: '🏁',
    color: '#000000',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'jdm_legend',
    name: 'JDM Legend',
    description: 'Own a Japanese Domestic Market car',
    icon: '🇯🇵',
    color: '#DC2626',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'euro_tuner',
    name: 'Euro Tuner',
    description: 'Own a European sports car',
    icon: '🇪🇺',
    color: '#3B82F6',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'american_muscle',
    name: 'American Muscle',
    description: 'Own a classic American muscle car',
    icon: '🇺🇸',
    color: '#DC2626',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🏛️ CLASSIC & VINTAGE BADGES
  {
    key: 'classic_lover',
    name: 'Classic Soul',
    description: 'Own a car older than 30 years',
    icon: '🏛️',
    color: '#6B7280',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'vintage_collector',
    name: 'Vintage Collector',
    description: 'Own a car older than 50 years',
    icon: '🕰️',
    color: '#92400E',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🌿 ECO & MODERN TECH BADGES
  {
    key: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Own an electric or hybrid vehicle',
    icon: '🌿',
    color: '#059669',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'future_ready',
    name: 'Future Ready',
    description: 'Own a fully electric vehicle',
    icon: '⚡🔋',
    color: '#10B981',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🔥 STREAK & ACTIVITY BADGES
  {
    key: 'daily_driver',
    name: 'Daily Driver',
    description: 'Active in app for 7 consecutive days',
    icon: '🔥',
    color: '#EF4444',
    isRare: false,
    isActive: true,
    requiredCount: 7,
  },
  {
    key: 'car_enthusiast',
    name: 'Car Enthusiast',
    description: 'Active for 30 consecutive days',
    icon: '🚗💨',
    color: '#8B5CF6',
    isRare: true,
    isActive: true,
    requiredCount: 30,
  },
  {
    key: 'car_photographer',
    name: 'Car Photographer',
    description: 'Uploaded photos for 5 consecutive days',
    icon: '📸',
    color: '#10B981',
    isRare: false,
    isActive: true,
    requiredCount: 5,
  },
  
  // ⭐ SOCIAL & POPULARITY BADGES
  {
    key: 'popular_ride',
    name: 'Popular Ride',
    description: 'Your car received 10 likes',
    icon: '⭐',
    color: '#F59E0B',
    isRare: false,
    isActive: true,
    requiredCount: 10,
  },
  {
    key: 'car_influencer',
    name: 'Car Influencer',
    description: 'Your car received 50 likes',
    icon: '🌟',
    color: '#F59E0B',
    isRare: true,
    isActive: true,
    requiredCount: 50,
  },
  {
    key: 'trendsetter',
    name: 'Trendsetter',
    description: 'First with this car model in the app',
    icon: '🏆',
    color: '#EC4899',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🏆 LUXURY & EXOTIC BADGES
  {
    key: 'luxury_owner',
    name: 'Luxury Owner',
    description: 'Own a premium luxury vehicle',
    icon: '💎',
    color: '#8B5CF6',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'supercar_owner',
    name: 'Supercar Owner',
    description: 'Own a supercar worth $100k+',
    icon: '🏎️',
    color: '#DC2626',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'exotic_collection',
    name: 'Exotic Collection',
    description: 'Own 3+ exotic/luxury cars',
    icon: '💰',
    color: '#F59E0B',
    isRare: true,
    isActive: true,
    requiredCount: 3,
  },
  
  // 🛠️ MODIFICATION & CUSTOMIZATION BADGES
  {
    key: 'stance_master',
    name: 'Stance Master',
    description: 'Lowered your car with coilovers/air suspension',
    icon: '📐',
    color: '#6B7280',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'exhaust_guru',
    name: 'Exhaust Guru',
    description: 'Installed a custom exhaust system',
    icon: '🔊',
    color: '#DC2626',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'boost_master',
    name: 'Boost Master',
    description: 'Added forced induction (turbo/supercharger)',
    icon: '💨',
    color: '#3B82F6',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🎨 AESTHETIC & SHOW BADGES
  {
    key: 'show_stopper',
    name: 'Show Stopper',
    description: 'Car won best in show at a meet',
    icon: '🏅',
    color: '#F59E0B',
    isRare: true,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'wrap_artist',
    name: 'Wrap Artist',
    description: 'Custom vinyl wrap or paint job',
    icon: '🎨',
    color: '#EC4899',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  
  // 🎉 SPECIAL EVENT BADGES
  {
    key: 'summer_cruiser',
    name: 'Summer Cruiser',
    description: 'Active during summer season',
    icon: '☀️',
    color: '#FCD34D',
    isRare: false,
    isActive: true,
    requiredCount: 1,
  },
  {
    key: 'night_rider',
    name: 'Night Rider',
    description: 'Active at night (10PM - 4AM) for 5 days',
    icon: '🌙',
    color: '#1E293B',
    isRare: true,
    isActive: true,
    requiredCount: 5,
  },
  {
    key: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Active every weekend for a month',
    icon: '🏁',
    color: '#059669',
    isRare: false,
    isActive: true,
    requiredCount: 4,
  },
];

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Delete old unwanted badges
    console.log('🗑️  Deleting old badges...');
    const badgesToDelete = ['romanian_pride', 'chat_starter', 'first_match'];
    
    for (const badgeKey of badgesToDelete) {
      await client.query('DELETE FROM badges WHERE key = $1', [badgeKey]);
      console.log(`   ❌ Deleted: ${badgeKey}`);
    }
    
    console.log('\n📦 Inserting new car-themed badges...\n');

    let inserted = 0;
    let updated = 0;

    for (const badge of carBadges) {
      // Check if badge exists
      const existing = await client.query(
        'SELECT id FROM badges WHERE key = $1',
        [badge.key]
      );

      if (existing.rows.length > 0) {
        // Update existing badge
        await client.query(
          `UPDATE badges SET 
            name = $1, 
            description = $2, 
            icon = $3, 
            color = $4, 
            "isRare" = $5, 
            "isActive" = $6, 
            "requiredCount" = $7
          WHERE key = $8`,
          [
            badge.name,
            badge.description,
            badge.icon,
            badge.color,
            badge.isRare,
            badge.isActive,
            badge.requiredCount,
            badge.key,
          ]
        );
        console.log(`   ✏️  Updated: ${badge.name} (${badge.icon})`);
        updated++;
      } else {
        // Insert new badge
        await client.query(
          `INSERT INTO badges (key, name, description, icon, color, "isRare", "isActive", "requiredCount")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            badge.key,
            badge.name,
            badge.description,
            badge.icon,
            badge.color,
            badge.isRare,
            badge.isActive,
            badge.requiredCount,
          ]
        );
        console.log(`   ✅ Inserted: ${badge.name} (${badge.icon})`);
        inserted++;
      }
    }

    console.log(`\n🎉 Badge population complete!`);
    console.log(`   📝 ${inserted} badges inserted`);
    console.log(`   ✏️  ${updated} badges updated`);
    console.log(`   🗑️  ${badgesToDelete.length} badges deleted`);

    // Show summary
    const total = await client.query('SELECT COUNT(*) as count FROM badges');
    console.log(`\n📊 Total badges in database: ${total.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
})();
