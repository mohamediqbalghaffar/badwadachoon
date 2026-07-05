
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.receivedLetter.deleteMany({});
      await tx.receivedLetter.createMany({
        data: [
          {
            subject: "test",
            department: "test",
            refCode: "test",
            letterType: "test",
            slaTime: "-",
            processingTime: ""
          }
        ]
      });
    });
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();

