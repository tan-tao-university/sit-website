import { createHash, randomBytes } from 'crypto';

const apiKey = randomBytes(32).toString('base64url');
const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');
const jwtSecret = randomBytes(64).toString('base64url');

console.log(`API_ACCESS_KEY=${apiKey}`);
console.log(`API_ACCESS_KEY_SHA256=${apiKeyHash}`);
console.log(`JWT_ACCESS_SECRET=${jwtSecret}`);
