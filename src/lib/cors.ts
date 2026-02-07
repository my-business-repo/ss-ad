import { NextResponse } from 'next/server';

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173', // Vite default
    'http://localhost:3000', // Next.js default
    'http://localhost:5174', // Alternative Vite port
    'https://ss-fe-ten.vercel.app', // Production frontend
];

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Handle CORS for API routes
 * @param request - The incoming request
 * @returns NextResponse with CORS headers or null if origin not allowed
 */
export function handleCors(request: Request): NextResponse | null {
    const origin = request.headers.get('origin') || '';

    // Check if origin is allowed
    const isAllowedOrigin = allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:');

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        if (isAllowedOrigin) {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                    ...corsOptions,
                },
            });
        }
        return new NextResponse(null, { status: 403 });
    }

    return null; // Not an OPTIONS request, continue with normal handling
}

/**
 * Add CORS headers to a response
 * @param response - The response to add headers to
 * @param request - The original request
 * @returns Response with CORS headers added
 */
export function addCorsHeaders(response: NextResponse, request: Request): NextResponse {
    const origin = request.headers.get('origin') || '';

    const isAllowedOrigin = allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:');

    if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', corsOptions['Access-Control-Allow-Methods']);
        response.headers.set('Access-Control-Allow-Headers', corsOptions['Access-Control-Allow-Headers']);
    }

    return response;
}
