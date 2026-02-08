
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Code requis' },
                { status: 400 }
            );
        }

        const match = await prisma.match.findUnique({
            where: { id },
            select: { accessCode: true },
        });

        if (!match) {
            return NextResponse.json(
                { success: false, error: 'Match non trouvé' },
                { status: 404 }
            );
        }

        if (match.accessCode !== code) {
            return NextResponse.json(
                { success: false, error: 'Code incorrect' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Code validé'
        });
    } catch (error) {
        console.error('Erreur validation code:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
