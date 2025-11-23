require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

// Badge-uri cu iconițe specifice din lucide-react
const badgeIconUpdates = [
  // 🚗 CAR COLLECTION BADGES
  { key: 'first_ride', icon: 'Car', description: 'Added your first car to the garage' },
  { key: 'car_collector', icon: 'Trophy', description: 'Own 3 or more cars' },
  { key: 'modification_master', icon: 'Wrench', description: 'Added 5+ modifications to a car' },
  
  // ⚡ PERFORMANCE BADGES
  { key: 'speed_demon', icon: 'Zap', description: 'Own a car with 300+ horsepower' },
  { key: 'horsepower_king', icon: 'Crown', description: 'Own a car with 500+ horsepower' },
  { key: 'turbo_enthusiast', icon: 'Wind', description: 'Own a turbocharged vehicle' },
  
  // 🏁 RACING & TUNING BADGES
  { key: 'track_warrior', icon: 'Flag', description: 'Own a car built for the track' },
  { key: 'jdm_legend', icon: 'Sparkles', description: 'Own a Japanese Domestic Market car' },
  { key: 'euro_tuner', icon: 'CircleDot', description: 'Own a European sports car' },
  { key: 'american_muscle', icon: 'Flame', description: 'Own a classic American muscle car' },
  
  // 🏛️ CLASSIC & VINTAGE BADGES
  { key: 'classic_lover', icon: 'Landmark', description: 'Own a car older than 30 years' },
  { key: 'vintage_collector', icon: 'Clock', description: 'Own a car older than 50 years' },
  
  // 🌿 ECO & MODERN TECH BADGES
  { key: 'eco_warrior', icon: 'Leaf', description: 'Own an electric or hybrid vehicle' },
  { key: 'future_ready', icon: 'Zap', description: 'Own a fully electric vehicle' },
  
  // 🔥 STREAK & ACTIVITY BADGES
  { key: 'daily_driver', icon: 'Flame', description: 'Active in app for 7 consecutive days' },
  { key: 'car_enthusiast', icon: 'Heart', description: 'Active for 30 consecutive days' },
  { key: 'car_photographer', icon: 'Camera', description: 'Uploaded photos for 5 consecutive days' },
  
  // ⭐ SOCIAL & POPULARITY BADGES
  { key: 'popular_ride', icon: 'Star', description: 'Your car received 10 likes' },
  { key: 'car_influencer', icon: 'Sparkles', description: 'Your car received 50 likes' },
  { key: 'trendsetter', icon: 'TrendingUp', description: 'First with this car model in the app' },
  
  // 🏆 LUXURY & EXOTIC BADGES
  { key: 'luxury_owner', icon: 'Gem', description: 'Own a premium luxury vehicle' },
  { key: 'supercar_owner', icon: 'Rocket', description: 'Own a supercar worth $100k+' },
  { key: 'exotic_collection', icon: 'Award', description: 'Own 3+ exotic/luxury cars' },
  
  // 🛠️ MODIFICATION & CUSTOMIZATION BADGES
  { key: 'stance_master', icon: 'Move', description: 'Lowered your car with coilovers/air suspension' },
  { key: 'exhaust_guru', icon: 'Volume2', description: 'Installed a custom exhaust system' },
  { key: 'boost_master', icon: 'Wind', description: 'Added forced induction (turbo/supercharger)' },
  
  // 🎨 AESTHETIC & SHOW BADGES
  { key: 'show_stopper', icon: 'Medal', description: 'Car won best in show at a meet' },
  { key: 'wrap_artist', icon: 'Palette', description: 'Custom vinyl wrap or paint job' },
  
  // 🎉 SPECIAL EVENT BADGES
  { key: 'summer_cruiser', icon: 'Sun', description: 'Active during summer season' },
  { key: 'night_rider', icon: 'Moon', description: 'Active at night (10PM - 4AM) for 5 days' },
  { key: 'weekend_warrior', icon: 'Flag', description: 'Active every weekend for a month' },
];

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    console.log('🎨 Updating badge icons to lucide-react components...\n');

    let updated = 0;

    for (const badge of badgeIconUpdates) {
      await client.query(
        'UPDATE badges SET icon = $1, description = $2 WHERE key = $3',
        [badge.icon, badge.description, badge.key]
      );
      console.log(`   ✅ ${badge.key.padEnd(25)} → ${badge.icon}`);
      updated++;
    }

    console.log(`\n🎉 Icon update complete!`);
    console.log(`   ✏️  ${updated} badges updated with lucide-react icons`);

    // Show sample of updated badges
    const sample = await client.query(
      'SELECT key, name, icon, color FROM badges LIMIT 5'
    );
    
    console.log('\n📋 Sample badges:');
    sample.rows.forEach(badge => {
      console.log(`   ${badge.icon.padEnd(15)} ${badge.name} (${badge.color})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
