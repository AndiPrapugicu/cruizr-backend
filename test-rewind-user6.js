// Test rewind functionality for user 6
async function testRewind() {
  try {
    console.log('Testing rewind functionality for user 6...');

    const response = await fetch(
      'http://localhost:3000/store/actions/swipe-rewind',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1Mjc3Njc1MywiZXhwIjoxNzUzMzgxNTUzfQ.aVuqi1MC7b8Ab54ke35LZ1g9JAS7n7lTXorBXe94QaM',
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();
    console.log('Rewind response:', data);
  } catch (error) {
    console.error('Rewind error:', error.message);
  }
}

testRewind();
