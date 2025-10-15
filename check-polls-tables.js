const Database = require('better-sqlite3');

try {
  const db = new Database('./database.sqlite');
  const tables = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
    .all();
  console.log('📋 All tables in database:', tables);

  // Check for polls-related tables
  const pollTables = tables.filter((t) =>
    t.name.toLowerCase().includes('poll'),
  );
  console.log('🗳️ Poll-related tables:', pollTables);

  db.close();
} catch (error) {
  console.error('❌ Error checking database:', error.message);
}
