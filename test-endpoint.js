const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/matches/received-super-likes',
  method: 'GET',
  headers: {
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6MiwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTI3NTE0NzgsImV4cCI6MTc1MzM1NjI3OH0.BecM-iNqkrCmi8jNv-7sD0ZLnEtBBuLMzgCxkWX6a08',
  },
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:');
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
