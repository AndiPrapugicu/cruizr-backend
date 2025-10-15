const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🏪 Setting up Store system...');

// Create store_items table
const createStoreItemsTable = `
CREATE TABLE IF NOT EXISTS store_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemId TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT CHECK(currency IN ('fuel', 'premium')) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  duration INTEGER,
  maxUses INTEGER,
  isActive BOOLEAN DEFAULT 1,
  isLimited BOOLEAN DEFAULT 0,
  limitedQuantity INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create user_inventory table
const createUserInventoryTable = `
CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  itemId TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  usesRemaining INTEGER,
  isActive BOOLEAN DEFAULT 1,
  activatedAt DATETIME,
  expiresAt DATETIME,
  purchasedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (itemId) REFERENCES store_items(itemId)
);
`;

// Create store_transactions table
const createStoreTransactionsTable = `
CREATE TABLE IF NOT EXISTS store_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  itemId TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  totalPrice DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  transactionType TEXT DEFAULT 'purchase',
  status TEXT DEFAULT 'completed',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (itemId) REFERENCES store_items(itemId)
);
`;

// Sample store items data
const storeItems = [
  // FUEL CURRENCY ITEMS
  // Power-ups
  {
    itemId: 'super_like',
    name: 'Super Like',
    description:
      'Stand out from the crowd with a super like that guarantees your profile is seen first',
    icon: '💖',
    price: 50,
    currency: 'fuel',
    category: 'power_ups',
    maxUses: 1,
    isActive: 1,
  },
  {
    itemId: 'boost_profile',
    name: 'Profile Boost',
    description:
      'Boost your profile visibility for 30 minutes and get 10x more views',
    icon: '🚀',
    price: 100,
    currency: 'fuel',
    category: 'power_ups',
    duration: 1800, // 30 minutes in seconds
    maxUses: 1,
    isActive: 1,
  },
  {
    itemId: 'rewind_last',
    name: 'Rewind',
    description: 'Undo your last swipe and get a second chance',
    icon: '⏪',
    price: 25,
    currency: 'fuel',
    category: 'power_ups',
    maxUses: 1,
    isActive: 1,
  },
  {
    itemId: 'unlimited_likes',
    name: 'Unlimited Likes',
    description: 'Like as many profiles as you want for 24 hours',
    icon: '❤️',
    price: 200,
    currency: 'fuel',
    category: 'power_ups',
    duration: 86400, // 24 hours
    maxUses: 1,
    isActive: 1,
  },

  // Customization
  {
    itemId: 'custom_badge',
    name: 'Custom Badge',
    description: 'Create and display your own custom badge on your profile',
    icon: '🏅',
    price: 150,
    currency: 'fuel',
    category: 'customization',
    isActive: 1,
  },
  {
    itemId: 'profile_frame',
    name: 'Profile Frame',
    description: 'Add a stylish frame around your profile picture',
    icon: '🖼️',
    price: 75,
    currency: 'fuel',
    category: 'customization',
    isActive: 1,
  },

  // PREMIUM CURRENCY ITEMS
  // Premium Features
  {
    itemId: 'vip_membership_7d',
    name: 'VIP Membership (7 days)',
    description:
      'Unlock all premium features for 7 days including unlimited likes, super boosts, and priority support',
    icon: '👑',
    price: 500,
    currency: 'premium',
    category: 'premium_features',
    duration: 604800, // 7 days
    requiresVip: 0,
    isActive: 1,
  },
  {
    itemId: 'vip_membership_30d',
    name: 'VIP Membership (30 days)',
    description:
      'Full VIP access for 30 days with all premium features and exclusive benefits',
    icon: '👑',
    price: 1500,
    currency: 'premium',
    category: 'premium_features',
    duration: 2592000, // 30 days
    requiresVip: 0,
    isActive: 1,
  },
  {
    itemId: 'see_who_likes',
    name: 'See Who Likes You',
    description: 'Discover who liked your profile and connect instantly',
    icon: '👀',
    price: 300,
    currency: 'premium',
    category: 'premium_features',
    duration: 604800, // 7 days
    isActive: 1,
  },
  {
    itemId: 'advanced_filters',
    name: 'Advanced Filters',
    description:
      'Filter potential matches by car type, horsepower, and other detailed preferences',
    icon: '🔍',
    price: 200,
    currency: 'premium',
    category: 'premium_features',
    duration: 2592000, // 30 days
    isActive: 1,
  },

  // Premium Badges
  {
    itemId: 'speedster_badge',
    name: 'Speedster Badge',
    description:
      'Exclusive badge for speed enthusiasts - show your need for speed',
    icon: '🏎️',
    price: 250,
    currency: 'premium',
    category: 'badges',
    isActive: 1,
  },
  {
    itemId: 'collector_badge',
    name: 'Collector Badge',
    description:
      'Premium badge for car collectors - display your passion for automotive history',
    icon: '🏆',
    price: 300,
    currency: 'premium',
    category: 'badges',
    isActive: 1,
  },
  {
    itemId: 'tuner_badge',
    name: 'Tuner Badge',
    description:
      'Show off your tuning skills with this exclusive modification badge',
    icon: '🔧',
    price: 275,
    currency: 'premium',
    category: 'badges',
    isActive: 1,
  },
];

// Execute table creation and data insertion
db.serialize(() => {
  // Create tables
  db.run(createStoreItemsTable, (err) => {
    if (err) {
      console.error('❌ Error creating store_items table:', err);
    } else {
      console.log('✅ store_items table created successfully');
    }
  });

  db.run(createUserInventoryTable, (err) => {
    if (err) {
      console.error('❌ Error creating user_inventory table:', err);
    } else {
      console.log('✅ user_inventory table created successfully');
    }
  });

  db.run(createStoreTransactionsTable, (err) => {
    if (err) {
      console.error('❌ Error creating store_transactions table:', err);
    } else {
      console.log('✅ store_transactions table created successfully');
    }
  });

  // Insert store items
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO store_items 
    (itemId, name, description, icon, price, currency, category, subcategory, duration, maxUses, isActive, isLimited)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  storeItems.forEach((item) => {
    insertStmt.run(
      [
        item.itemId,
        item.name,
        item.description,
        item.icon,
        item.price,
        item.currency,
        item.category,
        item.subcategory || null,
        item.duration || null,
        item.maxUses || null,
        item.isActive,
        item.isLimited || 0,
      ],
      (err) => {
        if (err) {
          console.error(`❌ Error inserting ${item.name}:`, err);
        } else {
          console.log(`✅ Added ${item.name} to store`);
        }
      },
    );
  });

  insertStmt.finalize();

  // Verify the data
  db.all('SELECT COUNT(*) as count FROM store_items', (err, rows) => {
    if (err) {
      console.error('❌ Error counting store items:', err);
    } else {
      console.log(`🎯 Total store items: ${rows[0].count}`);
    }
  });

  // Show sample data
  db.all(
    'SELECT itemId, name, price, currency, category FROM store_items LIMIT 5',
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching sample data:', err);
      } else {
        console.log('\n📦 Sample store items:');
        rows.forEach((row) => {
          console.log(
            `  - ${row.name} (${row.price} ${row.currency}) - ${row.category}`,
          );
        });
      }

      console.log('\n🏪 Store setup completed successfully!');
      db.close();
    },
  );
});
