const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('=== ADDING NEW UNIFIED PROFILE FRAME ===');

// Add new unified Profile Frame with color selection
const newFrame = {
  itemId: 'profile_frame_basic',
  name: 'Profile Frame',
  description:
    'A customizable profile frame where you can choose your favorite color. Simple, elegant, and personal!',
  icon: 'crown',
  price: 50,
  currency: 'fuel',
  category: 'Profile Enhancement',
  subcategory: 'frames',
  duration: null,
  maxUses: null,
  isActive: 1,
  isPermanent: 1,
  isLimited: 0,
  limitedQuantity: null,
  requirements: null,
  effects: JSON.stringify({
    profile_enhancement: true,
    customizable_colors: ['blue', 'green', 'yellow', 'red'],
    style: 'basic',
  }),
  metadata: JSON.stringify({
    tier: 'basic',
    color_options: ['blue', 'green', 'yellow', 'red'],
    original: true,
  }),
  type: 'profile_frame',
  features: JSON.stringify([
    'Choose from multiple colors',
    'Blue, Green, Yellow, Red options',
    'Clean and simple design',
    'Easy to activate/deactivate',
    'Perfect for beginners',
  ]),
};

db.run(
  `INSERT INTO store_items (
  itemId, name, description, icon, price, currency, category, subcategory, 
  duration, maxUses, isActive, isPermanent, isLimited, limitedQuantity,
  requirements, effects, metadata, type, features
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    newFrame.itemId,
    newFrame.name,
    newFrame.description,
    newFrame.icon,
    newFrame.price,
    newFrame.currency,
    newFrame.category,
    newFrame.subcategory,
    newFrame.duration,
    newFrame.maxUses,
    newFrame.isActive,
    newFrame.isPermanent,
    newFrame.isLimited,
    newFrame.limitedQuantity,
    newFrame.requirements,
    newFrame.effects,
    newFrame.metadata,
    newFrame.type,
    newFrame.features,
  ],
  function (err) {
    if (err) {
      console.error('Error adding new frame:', err);
    } else {
      console.log('✓ Added new unified Profile Frame with color selection');
    }

    // Check final result
    db.all(
      "SELECT * FROM store_items WHERE type = 'profile_frame' AND currency = 'fuel' ORDER BY price",
      (err, rows) => {
        if (err) {
          console.error('Error checking frames:', err);
          return;
        }

        console.log('\n=== FUEL PROFILE FRAMES AFTER UPDATE ===');
        rows.forEach((frame) => {
          console.log(
            `ID: ${frame.itemId} - ${frame.name} - ${frame.price} fuel`,
          );
        });

        console.log(`\nTotal Fuel Profile Frames: ${rows.length}`);

        db.close();
      },
    );
  },
);
