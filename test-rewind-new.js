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
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTI3NzY2MTUsImV4cCI6MTc1MzM4MTQxNX0.cx9fH0pOLnDbyu2oJLjvxTW8D99EAP_lnrZ33EQTsVo',
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
