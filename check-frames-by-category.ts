import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [],
  synchronize: false,
});

async function checkFrames() {
  try {
    await AppDataSource.initialize();

    const result = await AppDataSource.query(
      'SELECT itemId, name, category, subcategory FROM store_items WHERE category LIKE ? OR subcategory LIKE ?',
      ['%frame%', '%frame%'],
    );

    console.log('=== PROFILE FRAME ITEMS ===');
    result.forEach((item: any) => {
      console.log(
        `ID: ${item.itemId} | Name: ${item.name} | Category: ${item.category} | Subcategory: ${item.subcategory}`,
      );
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFrames();
