const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.userAccount.updateMany({
    where: {
      status: 'approved'
    },
    data: {
      status: 'active'
    }
  });
  console.log(`Updated ${result.count} users from approved to active.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
