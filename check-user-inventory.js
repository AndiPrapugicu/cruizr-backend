const Database = require('better-sqlite3');

try {
  const db = new Database('./database.sqlite');

  console.log('🔍 Checking user_inventory table structure...');

  // Check if table exists
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_inventory'",
    )
    .get();

  if (tableExists) {
    console.log('✅ user_inventory table exists!');

    // Get table structure
    const schema = db.prepare('PRAGMA table_info(user_inventory)').all();
    console.log('\nUser inventory table structure:');
    schema.forEach((column) => {
      const nullable = column.notnull ? '(NOT NULL)' : '(NULL)';
      const pk = column.pk ? ' PRIMARY KEY' : '';
      console.log(`${column.name}: ${column.type} ${nullable}${pk}`);
    });

    // Check current data
    console.log('\n📊 Current user_inventory data:');
    const inventory = db.prepare('SELECT * FROM user_inventory').all();
    if (inventory.length > 0) {
      console.log(`Found ${inventory.length} items in inventory:`);
      inventory.forEach((item) => {
        console.log(
          `- ID: ${item.id}, User: ${item.userId}, Item: ${item.itemId}, Active: ${item.isActive}`,
        );
      });
    } else {
      console.log('No items found in user inventory');
    }
  } else {
    console.log('❌ user_inventory table does NOT exist!');
    console.log('Creating user_inventory table...');

    // Create the table based on the TypeScript entity structure
    db.exec(`
      CREATE TABLE user_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        itemId VARCHAR NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        isActive BOOLEAN NOT NULL DEFAULT 0,
        usesRemaining INTEGER NULL,
        expiryDate DATETIME NULL,
        purchasedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        metadata JSON NULL,
        FOREIGN KEY (userId) REFERENCES users (userId)
      )
    `);

    console.log('✅ user_inventory table created successfully!');
  }

  db.close();
  console.log('\n✨ Check completed!');
} catch (error) {
  console.error('❌ Error:', error);
}
