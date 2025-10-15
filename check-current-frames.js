const { DataSource } = require('typeorm');
const { StoreItem } = require('./src/store/entities/store-item.entity');

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [StoreItem],
  synchronize: false,
});

async function checkFrames() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected!');

    const storeItemRepository = AppDataSource.getRepository(StoreItem);

    console.log('\n=== CURRENT PROFILE FRAMES ===');
    const frames = await storeItemRepository.find({
      where: { type: 'profile_frame' },
      order: { currency: 'ASC', price: 'ASC' },
    });

    frames.forEach((frame) => {
      console.log(
        `ID: ${frame.itemId} - ${frame.name} - ${frame.currency === 'fuel' ? frame.price + ' fuel' : frame.price + ' premium'} - ${frame.description}`,
      );
    });

    console.log(`\nTotal Profile Frames: ${frames.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkFrames();
