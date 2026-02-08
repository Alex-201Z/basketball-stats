import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const email = 'test@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const matchExists = await prisma.user.findUnique({
            where: { email },
        });

        if (matchExists) {
            // Mettre à jour le mot de passe pour être sûr
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'admin',
                    name: 'Test Admin'
                }
            });
            return NextResponse.json({ success: true, message: 'Existing test user updated', credentials: { email, password } });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Test Admin',
                role: 'admin',
            },
        });

        return NextResponse.json({ success: true, data: user, credentials: { email, password } });
    } catch (error) {
        console.error('Error creating test user:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
