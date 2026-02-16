import { PrismaClient } from '../generated/prisma/client.js';
import { logger } from './logger.js';
let prisma;
export function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
        logger.info('Prisma client initialized');
    }
    return prisma;
}
export async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
    }
}
//# sourceMappingURL=database.js.map