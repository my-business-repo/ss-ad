import { NextResponse } from 'next/server';

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173', // Vite default
    'http://localhost:3000', // Next.js default
    'http://localhost:5174', // Alternative Vite port
    'http://localhost:4173', // Vite preview
    'http://localhost:8080', // Common alt port
    'https://ss-fe-ten.vercel.app', // Production frontend
    'https://ss-fe-ten.vercel.app/', // Production frontend with trailing slash
];

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string): boolean {
    if (!origin) return false;

    // Check exact matches (with and without trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isExactMatch = allowedOrigins.some(allowed => {
        const normalizedAllowed = allowed.replace(/\/$/, '');
        return normalizedAllowed === normalizedOrigin;
    });

    if (isExactMatch) return true;

    // Allow all localhost origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return true;
    }

    // Allow vercel preview deployments
    if (origin.includes('.vercel.app')) {
        return true;
    }

    return false;
}

/**
 * Handle CORS for API routes
 * @param request - The incoming request
 * @returns NextResponse with CORS headers or null if origin not allowed
 */
export function handleCors(request: Request): NextResponse | null {
    const origin = request.headers.get('origin') || '';
    const isAllowed = isOriginAllowed(origin);

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        if (isAllowed) {
            const response = new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Methods': corsOptions['Access-Control-Allow-Methods'],
                    'Access-Control-Allow-Headers': corsOptions['Access-Control-Allow-Headers'],
                    'Access-Control-Max-Age': corsOptions['Access-Control-Max-Age'],
                },
            });
            return response;
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
    const isAllowed = isOriginAllowed(origin);

    if (isAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', corsOptions['Access-Control-Allow-Methods']);
        response.headers.set('Access-Control-Allow-Headers', corsOptions['Access-Control-Allow-Headers']);
        response.headers.set('Access-Control-Max-Age', corsOptions['Access-Control-Max-Age']);
    }

    return response;
}
