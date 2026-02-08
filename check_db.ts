import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'basketball_stats',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    connectionLimit: 10, // Assuming this is valid for the adapter constructor or pool
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const teamCount = await prisma.team.count();
    const playerCount = await prisma.player.count();
    const matchCount = await prisma.match.count();

    console.log(`Teams: ${teamCount}`);
    console.log(`Players: ${playerCount}`);
    console.log(`Matches: ${matchCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
