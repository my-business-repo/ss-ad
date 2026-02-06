import { signToken, verifyToken } from '../src/lib/jwt';

console.log('Testing JWT Utility...');

const payload = { id: 123, email: 'test@example.com' };
console.log('Payload:', payload);

const token = signToken(payload);
console.log('Generated Token:', token);

const decoded = verifyToken(token);
console.log('Decoded Token:', decoded);

if (decoded && decoded.id === payload.id && decoded.email === payload.email) {
    console.log('SUCCESS: Token verified correctly.');
} else {
    console.error('FAILURE: Token verification failed.');
    process.exit(1);
}
