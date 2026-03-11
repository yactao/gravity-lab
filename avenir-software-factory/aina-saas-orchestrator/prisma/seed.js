const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Avenir Software',
            tierPlan: 'Pro',
            tokensAvailable: 50000,
            users: {
                create: {
                    email: 'taoufik@avenir.com',
                    role: 'admin',
                },
            },
        },
    });
    console.log('Seeded tenant:', tenant);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
