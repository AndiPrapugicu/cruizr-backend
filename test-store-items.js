// Test store items endpoint
async function testStoreItems() {
  try {
    console.log('Testing store items endpoint...');

    const response = await fetch('http://localhost:3000/store/items', {
      method: 'GET',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTI3NzY2MTUsImV4cCI6MTc1MzM4MTQxNX0.cx9fH0pOLnDbyu2oJLjvxTW8D99EAP_lnrZ33EQTsVo',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    const items = data.storeItems || data.items || data;
    if (Array.isArray(items)) {
      console.log(`Found ${items.length} store items:`);
      items.forEach((item) => {
        console.log(
          `- ${item.name} (${item.itemId}): ${item.price} ${item.currency}`,
        );
      });
    } else {
      console.log('No items array found in response');
    }
  } catch (error) {
    console.error('Store items error:', error.message);
  }
}

testStoreItems();
