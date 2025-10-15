const jwt = require('jsonwebtoken');

// Use the same secret as in your .env file
const JWT_SECRET = 'your_jwt_secret_key_2024';

// Generate token for user 21 (Cox)
const payload = {
  email: 'cox1754669946368@carmatch.temp',
  sub: 21,
  name: 'Cox',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
};

const token = jwt.sign(payload, JWT_SECRET);

console.log('Token for user 21 (Cox):');
console.log(token);

// Also generate token for user 1 (main account)
const payload1 = {
  email: 'andi@andi.com',
  sub: 1,
  name: 'Andi Hatz',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
};

const token1 = jwt.sign(payload1, JWT_SECRET);

console.log('\nToken for user 1 (Andi):');
console.log(token1);
