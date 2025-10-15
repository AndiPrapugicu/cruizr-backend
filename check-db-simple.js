const fs = require('fs');
const path = require('path');

console.log('🔍 Checking database files...');

// Check if database.sqlite exists
const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) {
  console.log('✅ database.sqlite exists');
  const stats = fs.statSync(dbPath);
  console.log(`📁 Size: ${stats.size} bytes`);
} else {
  console.log('❌ database.sqlite not found');
}

// Check data folder
const dataPath = path.join(__dirname, 'data');
if (fs.existsSync(dataPath)) {
  console.log('✅ data folder exists');
  const files = fs.readdirSync(dataPath);
  console.log('📁 Files in data folder:', files);

  // Check sqlite.db
  const sqliteDbPath = path.join(dataPath, 'sqlite.db');
  if (fs.existsSync(sqliteDbPath)) {
    console.log('✅ data/sqlite.db exists');
    const stats = fs.statSync(sqliteDbPath);
    console.log(`📁 Size: ${stats.size} bytes`);
  }
} else {
  console.log('❌ data folder not found');
}

console.log(
  '\n🎯 To check database structure, use TypeORM CLI or create the user_inventory table manually.',
);
