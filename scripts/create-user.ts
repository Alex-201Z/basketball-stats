// Charger les variables d'environnement nativement (Node 20+)
if (process.loadEnvFile) {
    process.loadEnvFile('.env');
}

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient(); // Supprimé

async function main() {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('User already exists, updating...');
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'admin',
                    name: 'Test Admin',
                },
            });
            console.log('User updated successfully');
        } else {
            console.log('Creating new user...');
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Test Admin',
                    role: 'admin',
                },
            });
            console.log('User created successfully');
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
