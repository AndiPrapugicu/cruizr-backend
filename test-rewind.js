// Test rewind functionality
async function testRewind() {
  try {
    console.log('Testing rewind functionality...');

    const response = await fetch(
      'http://localhost:3000/store/actions/swipe-rewind',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsImlhdCI6MTcyNjU4NjM2MiwiZXhwIjoxNzI2NTg5OTYyfQ.6h26cdfhwMHfJhwUXp3r_xz9_2gm8NlOvjKjrHAqZQo',
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
