import prisma from "../src/lib/prisma";

async function main() {
  console.log("Testing Prisma DB Connection...");
  const user = await prisma.user.upsert({
    where: { email: "test-gaffer@arena.fc" },
    update: {},
    create: {
      email: "test-gaffer@arena.fc",
      name: "Test Manager",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=TestGaffer",
    },
  });
  console.log("Upserted user:", user.id, user.name);
  const count = await prisma.user.count();
  console.log(`Total users in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
