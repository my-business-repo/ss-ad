import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

export async function POST(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Authenticate customer
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            const response = NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            const response = NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            const response = NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            const response = NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // Upload to R2
        let imageUrl: string;
        try {
            imageUrl = await uploadFile(file, 'customer-chat-images');
        } catch (error) {
            console.error('Failed to upload customer chat image:', error);
            const response = NextResponse.json(
                { error: 'Failed to upload image' },
                { status: 500 }
            );
            return addCorsHeaders(response, req);
        }

        const response = NextResponse.json({
            success: true,
            url: imageUrl
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Customer chat upload error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
