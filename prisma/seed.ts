import 'dotenv/config';
import { PrismaClient, League, Position, MatchStatus } from '../src/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'basketball_stats',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    connectionLimit: 10,
});

const prisma = new PrismaClient({ adapter });

const TEAMS_COUNT = 30;
const PLAYERS_PER_TEAM = 5;
const MATCHES_COUNT = 30;

const FIRST_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const TEAM_CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'];
const TEAM_SUFFIXES = ['Lions', 'Tigers', 'Bears', 'Eagles', 'Sharks', 'Wolves', 'Panthers', 'Falcons', 'Dragons', 'Knights'];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    console.log('Start seeding ...');

    // Create Teams
    const teams = [];
    for (let i = 0; i < TEAMS_COUNT; i++) {
        const city = getRandomItem(TEAM_CITIES);
        const suffix = getRandomItem(TEAM_SUFFIXES);
        const name = `${city} ${suffix} ${i + 1}`; // Ensure uniqueness

        const team = await prisma.team.create({
            data: {
                id: `team-${i + 1}`,
                name: name,
                league: League.local,
            },
        });
        teams.push(team);
        console.log(`Created team with id: ${team.id}`);

        // Create Players for this team
        for (let j = 0; j < PLAYERS_PER_TEAM; j++) {
            await prisma.player.create({
                data: {
                    id: `player-${team.id}-${j + 1}`,
                    firstName: getRandomItem(FIRST_NAMES),
                    lastName: getRandomItem(LAST_NAMES),
                    jerseyNumber: getRandomInt(0, 99),
                    position: getRandomItem(Object.values(Position)),
                    teamId: team.id,
                    age: getRandomInt(18, 35),
                    league: League.local,
                },
            });
        }
    }
    console.log(`Created ${teams.length} teams and ${teams.length * PLAYERS_PER_TEAM} players.`);

    // Create Matches
    for (let i = 0; i < MATCHES_COUNT; i++) {
        const homeTeam = getRandomItem(teams);
        let awayTeam = getRandomItem(teams);
        while (awayTeam.id === homeTeam.id) {
            awayTeam = getRandomItem(teams);
        }

        const isPast = i < MATCHES_COUNT / 2;
        const date = new Date();
        date.setDate(date.getDate() + (isPast ? -getRandomInt(1, 30) : getRandomInt(1, 30)));

        let status = MatchStatus.scheduled;
        let homeScore = 0;
        let awayScore = 0;

        if (isPast) {
            status = MatchStatus.completed;
            homeScore = getRandomInt(60, 120);
            awayScore = getRandomInt(60, 120);
        }

        await prisma.match.create({
            data: {
                id: `match-${i + 1}`,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                matchDate: date,
                status: status,
                homeScore: homeScore,
                awayScore: awayScore,
                league: League.local,
            },
        });
    }
    console.log(`Created ${MATCHES_COUNT} matches.`);

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
