import "dotenv/config";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") process.exit(1); // Ctrl+C
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const email = (await rl.question("Admin e-mail: ")).trim().toLowerCase();
  const name = (await rl.question("Admin name: ")).trim();
  rl.close();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2) {
    throw new Error("Invalid e-mail or name");
  }

  const password = await askHidden("Password (12+ characters, hidden): ");
  if (password.length < 12 || password.length > 72) {
    throw new Error("Password must be 12 to 72 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, passwordHash, name, role: "ADMIN" },
  });

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());