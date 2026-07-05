
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const letters = await prisma.receivedLetter.findMany({ take: 5 });
  console.log(letters.map(l => l.refCode));
}
main().finally(() => prisma.$disconnect());

