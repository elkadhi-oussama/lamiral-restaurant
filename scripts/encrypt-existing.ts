import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { encryptField, isEncrypted } from "../lib/crypto";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  let users = 0;
  let orders = 0;

  const allUsers = await prisma.user.findMany({
    select: { id: true, phone: true },
  });
  for (const user of allUsers) {
    if (user.phone && !isEncrypted(user.phone)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: encryptField(user.phone) },
      });
      users++;
    }
  }

  const allOrders = await prisma.order.findMany({
    select: { id: true, customerPhone: true },
  });
  for (const order of allOrders) {
    if (!isEncrypted(order.customerPhone)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { customerPhone: encryptField(order.customerPhone) },
      });
      orders++;
    }
  }

  console.log(`Encrypted ${users} user phones and ${orders} order phones`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());