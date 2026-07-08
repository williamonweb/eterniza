import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const password = await bcrypt.hash("eterniza123", 10);

  await prisma.user.upsert({
    where: { email: "jeslie@eterniza.com" },
    update: {
      name: "Jeslie",
      password,
      role: "ADMIN",
    },
    create: {
      name: "Jeslie",
      email: "jeslie@eterniza.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin Jeslie criado/atualizado com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });