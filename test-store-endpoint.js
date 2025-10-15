async function testStoreEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/store/items', {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsInVzZXJJZCI6MSwibmFtZSI6IkFuZGkgSGF0eiIsImlhdCI6MTc1NDU0NTU3MCwiZXhwIjoxNzU1MTUwMzcwfQ.XKWExOw50vPiUqC-om29DTIFgVhLjqkM7bkmf0v_5m0',
      },
    });

    const data = await response.json();
    console.log('🏪 Store Items Response:');
    console.log('Response status:', response.status);
    console.log(
      'Raw response:',
      JSON.stringify(data, null, 2).substring(0, 500) + '...',
    );

    // Check if it's an array or object with items property
    const items = Array.isArray(data) ? data : data.items || [];
    console.log('Items count:', items.length);

    if (items.length > 0) {
      console.log('\n📦 First 3 items:');
      items.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Is Implemented: ${item.isImplemented}`);
        console.log(`   Is Permanent: ${item.isPermanent}`);
        console.log(`   Cooldown Until: ${item.cooldownUntil || 'None'}`);
        console.log(`   Purchased: ${item.purchased}`);
        console.log(`   Active: ${item.active}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStoreEndpoint();
