import { Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryStorage {
  private data: Map<string, any> = new Map();
  private counter = 0;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Add demo data
    this.data.set("1", { id: "1", createdAt: new Date() });
    this.counter = 1;
  }

  async findAll() {
    return Array.from(this.data.values());
  }

  async findById(id: string) {
    return this.data.get(id) || null;
  }

  async create(data: any) {
    this.counter++;
    const id = String(this.counter);
    const item = { id, ...data, createdAt: new Date() };
    this.data.set(id, item);
    return item;
  }

  async update(id: string, data: any) {
    const item = this.data.get(id);
    if (!item) return null;
    const updated = { ...item, ...data };
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    const item = this.data.get(id);
    if (!item) return null;
    this.data.delete(id);
    return item;
  }
}
