import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Super Admin";


  const passwordHash = await bcrypt.hash(password, 12);


  const admin = await prisma.user.upsert({

    where: {
      email
    },

    update: {
      passwordHash,
      name,
      role: "ADMIN"
    },

    create: {
      email,
      passwordHash,
      name,
      role: "ADMIN"
    }

  });


  console.log(`Seeded admin user: ${admin.email}`);

}


main()
  .catch((e) => {

    console.error(e);
    process.exit(1);

  })
  .finally(async () => {

    await prisma.$disconnect();

  });