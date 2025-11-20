// Reset user photos to empty array (for testing Base64 upload)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function resetUserPhotos(userId) {
  try {
    console.log(`🔄 Resetting photos for user ${userId}...`);
    
    const result = await pool.query(
      `UPDATE users SET photos = '[]', "imageUrl" = NULL WHERE id = $1 RETURNING id, name, photos, "imageUrl"`,
      [userId]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ User photos reset:', result.rows[0]);
    } else {
      console.log('❌ User not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

// Get user ID from command line argument
const userId = process.argv[2] || 2; // Default to user ID 2 (Andi)
resetUserPhotos(userId);
