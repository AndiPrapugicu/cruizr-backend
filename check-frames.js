const Database = require('better-sqlite3');

const db = new Database('./database.sqlite');

try {
  const frames = db.prepare(`
    SELECT name, itemId, price, currency 
    FROM store_items 
    WHERE category = 'Profile Frames' 
    ORDER BY price ASC
  `).all();
  
  console.log('Profile Frames in store:');
  frames.forEach(frame => {
    console.log(`- ${frame.name} (ID: ${frame.itemId}) - ${frame.price} ${frame.currency}`);
  });
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}

    const storeItemRepository = dataSource.getRepository(StoreItem);

    console.log('\n=== CURRENT PROFILE FRAMES ===');
    const frames = await storeItemRepository.find({
      where: { type: 'profile_frame' },
      order: { currency: 'ASC', price: 'ASC' },
    });

    frames.forEach((frame) => {
      const currency =
        frame.currency === 'fuel' ? `${frame.price} 🔥` : `${frame.price} 💎`;
      console.log(`${frame.name} - ${currency} - ${frame.description}`);
    });

    console.log(`\nTotal profile frames: ${frames.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkFrames();
