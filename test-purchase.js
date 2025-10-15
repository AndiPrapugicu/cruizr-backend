const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/store/purchase',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTI3NTI4MzcsImV4cCI6MTc1MzM1NzYzN30.TesDcylo-1nxxdtAsMS5aueY88UN0W4fIeUYtKEQH6Y',
  },
};

const postData = JSON.stringify({
  itemId: 'super-like-5pack',
});

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

req.write(postData);
req.end();
