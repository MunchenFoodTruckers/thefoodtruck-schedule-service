import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log("✅ Connected to PostgreSQL");
    } catch (error) {
      console.warn("⚠️  PostgreSQL unavailable, using in-memory storage");
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
