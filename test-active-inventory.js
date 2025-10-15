// Test active inventory for user 6
async function testActiveInventory() {
  try {
    console.log('Testing active inventory for user 6...');

    const response = await fetch(
      'http://localhost:3000/store/my-inventory/active',
      {
        method: 'GET',
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1Mjc3Njc1MywiZXhwIjoxNzUzMzgxNTUzfQ.aVuqi1MC7b8Ab54ke35LZ1g9JAS7n7lTXorBXe94QaM',
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();
    console.log('Active inventory response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Active inventory error:', error.message);
  }
}

testActiveInventory();
