const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('=== REMOVING OLD BASIC FRAMES AND ADDING NEW ONE ===');

// Remove the 4 basic color frames
const framesToRemove = [
  'profile_frame_basic_blue',
  'profile_frame_basic_green',
  'profile_frame_basic_yellow',
  'profile_frame_basic_red',
];

// Delete old frames
framesToRemove.forEach((frameId) => {
  db.run('DELETE FROM store_items WHERE itemId = ?', [frameId], function (err) {
    if (err) {
      console.error(`Error removing ${frameId}:`, err);
    } else {
      console.log(`✓ Removed ${frameId}`);
    }
  });
});

// Add new unified Profile Frame with color selection
const newFrame = {
  itemId: 'profile_frame_basic',
  name: 'Profile Frame',
  description:
    'A customizable profile frame where you can choose your favorite color. Simple, elegant, and personal!',
  price: 50,
  currency: 'fuel',
  category: 'Profile Enhancement',
  type: 'profile_frame',
  isPopular: false,
  features: JSON.stringify([
    'Choose from multiple colors',
    'Blue, Green, Yellow, Red options',
    'Clean and simple design',
    'Easy to activate/deactivate',
    'Perfect for beginners',
  ]),
  realMoneyCost: null,
};

db.run(
  `INSERT INTO store_items (
  itemId, name, description, price, currency, category, type, isPopular, features, realMoneyCost
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    newFrame.itemId,
    newFrame.name,
    newFrame.description,
    newFrame.price,
    newFrame.currency,
    newFrame.category,
    newFrame.type,
    newFrame.isPopular,
    newFrame.features,
    newFrame.realMoneyCost,
  ],
  function (err) {
    if (err) {
      console.error('Error adding new frame:', err);
    } else {
      console.log('✓ Added new Profile Frame with color selection');
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
            `ID: ${frame.itemId} - ${frame.name} - ${frame.price} fuel - ${frame.description.substring(0, 60)}...`,
          );
        });

        db.close();
      },
    );
  },
);
