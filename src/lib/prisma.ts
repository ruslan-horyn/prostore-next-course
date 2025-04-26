import { PrismaClient } from "@/generated/prisma";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { SCHEMA_NAME } from "./constants";

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Instantiates the Prisma adapter using the Neon connection pool to handle the connection between Prisma and Neon.
const adapter = new PrismaNeon(
  { connectionString },
  {
    schema: SCHEMA_NAME,
  }
);
// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
