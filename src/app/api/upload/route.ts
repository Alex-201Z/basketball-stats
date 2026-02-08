
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const folder = request.nextUrl.searchParams.get('folder') || 'misc';

        // Validate folder name (simple regex to prevent directory traversal)
        if (!/^[a-zA-Z0-9-_]+$/.test(folder)) {
            return NextResponse.json(
                { success: false, error: 'Invalid folder name' },
                { status: 400 }
            );
        }

        // Save to public/uploads/{folder}
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${folder}/${filename}`;

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Error uploading file' },
            { status: 500 }
        );
    }
}
