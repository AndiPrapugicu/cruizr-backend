import { DataSource } from 'typeorm';
import { StoreItem } from './src/store/store.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [StoreItem],
  synchronize: false,
});

async function checkFrameIds() {
  try {
    await AppDataSource.initialize();

    const storeRepository = AppDataSource.getRepository(StoreItem);
    const frames = await storeRepository.find({
      where: { type: 'profile_frame' },
      select: ['itemId', 'name'],
    });

    console.log('=== PROFILE FRAME ITEM IDs ===');
    frames.forEach((frame) => {
      console.log(`ID: ${frame.itemId} | Name: ${frame.name}`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFrameIds();
