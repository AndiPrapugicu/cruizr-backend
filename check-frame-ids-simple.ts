import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [],
  synchronize: false,
});

async function checkFrameIds() {
  try {
    await AppDataSource.initialize();

    const result = await AppDataSource.query(
      'SELECT itemId, name FROM store_items WHERE type = ?',
      ['profile_frame'],
    );

    console.log('=== PROFILE FRAME ITEM IDs ===');
    result.forEach((frame: any) => {
      console.log(`ID: ${frame.itemId} | Name: ${frame.name}`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFrameIds();
