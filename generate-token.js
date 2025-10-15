const jwt = require('jsonwebtoken');

// Generate JWT token for Andi Hatz (User ID 1)
const payload = {
  email: 'andi@andi.com',
  sub: 1,
  userId: 1,
  name: 'Andi Hatz',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
};

const token = jwt.sign(
  payload,
  '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2a7e9d3f58c0bafde4e1a4c2',
);
console.log('JWT Token for Andi Hatz (User ID 1):');
console.log(token);
