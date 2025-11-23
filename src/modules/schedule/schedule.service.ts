import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { InMemoryStorage } from "../../storage/in-memory.service";

@Injectable()
export class UscheduleService {
  private inMemory: InMemoryStorage = new InMemoryStorage();
  private useInMemory: boolean = false;

  constructor(private prisma: PrismaService) {
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.useInMemory = false;
    } catch {
      this.useInMemory = true;
      console.log("📦 Using in-memory storage for schedule service");
    }
  }

  async findAll() {
    if (this.useInMemory) {
      return this.inMemory.findAll();
    }
    return this.prisma.schedule.findMany();
  }

  async findOne(id: string) {
    if (this.useInMemory) {
      return this.inMemory.findById(id);
    }
    return this.prisma.schedule.findUnique({ where: { id } });
  }

  async create(data: any) {
    if (this.useInMemory) {
      return this.inMemory.create(data);
    }
    return this.prisma.schedule.create({ data });
  }
}
