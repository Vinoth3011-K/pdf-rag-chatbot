import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessageSource.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });

  console.log("Database truncated — admin credentials preserved.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
