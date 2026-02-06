import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-production';

export function signToken(payload: object, expiresIn: string | number = '30d'): string {
    const options: SignOptions = {
        expiresIn: expiresIn as SignOptions['expiresIn']
    };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
