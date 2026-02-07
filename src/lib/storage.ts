import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import sharp from "sharp";

// Initialize S3 Client for Cloudflare R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    console.warn("Missing R2 environment variables. File upload might fail.");
}

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || "",
        secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
});

// Alias for backward compatibility or clarity if needed
export const uploadToR2 = uploadFile;

export async function uploadFile(file: File, folder: string = "products"): Promise<string> {
    if (!R2_BUCKET_NAME) {
        throw new Error("R2_BUCKET_NAME is not defined");
    }

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    // Compress image if applicable
    if (file.type.startsWith("image/")) {
        try {
            buffer = await sharp(buffer)
                .resize(1200, 1200, { // Resize to max 1200x1200, maintaining aspect ratio
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .toFormat("webp", { quality: 80 }) // Convert to WebP with 80% quality
                .toBuffer();
        } catch (error) {
            console.error("Image compression failed, using original file:", error);
        }
    }

    // Generate unique filename (change extension to .webp if compressed)
    const timestamp = Date.now();
    let extension = file.name.split(".").pop();
    if (file.type.startsWith("image/")) {
        extension = "webp";
    }
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: file.type.startsWith("image/") ? "image/webp" : file.type,
                ACL: "public-read",
            },
        });

        await upload.done();

        // Construct public URL
        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${filename}`
            : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${filename}`;


        console.log("upload is :::::::", upload);

        return publicUrl;
    } catch (error) {
        console.error("Error uploading file to R2:", error);
        throw new Error("Failed to upload image");
    }
}

export async function deleteFile(key: string): Promise<void> {
    if (!R2_BUCKET_NAME) {
        throw new Error("R2_BUCKET_NAME is not defined");
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
    } catch (error) {
        console.error("Error deleting file from R2:", error);
    }
}