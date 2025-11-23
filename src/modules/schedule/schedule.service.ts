import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { InMemoryStorage } from "../../storage/in-memory.service";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateFoodTruckDto,
  UpdateAvailabilityDto,
  LocationSearchDto,
} from "./dto";

@Injectable()
export class ScheduleService {
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

  // ===== FOOD TRUCK MANAGEMENT =====

  async createFoodTruck(dto: CreateFoodTruckDto) {
    if (this.useInMemory) {
      return { id: Math.random().toString(), ...dto, isActive: true };
    }
    return this.prisma.foodTruck.create({ data: dto });
  }

  async getAllFoodTrucks() {
    if (this.useInMemory) {
      return [
        {
          id: "1",
          name: "München Street Eats",
          description: "Authentic Bavarian street food",
          isActive: true,
        },
      ];
    }
    return this.prisma.foodTruck.findMany({
      include: { schedules: true },
    });
  }

  async getFoodTruckById(id: string) {
    if (this.useInMemory) {
      return {
        id,
        name: "München Street Eats",
        description: "Authentic Bavarian street food",
        isActive: true,
      };
    }
    return this.prisma.foodTruck.findUnique({
      where: { id },
      include: { schedules: true },
    });
  }

  // ===== SCHEDULE MANAGEMENT =====

  async createSchedule(dto: CreateScheduleDto) {
    if (this.useInMemory) {
      return this.inMemory.create(dto);
    }
    return this.prisma.schedule.create({
      data: dto,
      include: { foodTruck: true },
    });
  }

  async getAllSchedules() {
    if (this.useInMemory) {
      return this.inMemory.findAll();
    }
    return this.prisma.schedule.findMany({
      where: { isActive: true },
      include: { foodTruck: true, availability: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  async getScheduleById(id: string) {
    if (this.useInMemory) {
      return this.inMemory.findById(id);
    }
    return this.prisma.schedule.findUnique({
      where: { id },
      include: { foodTruck: true, availability: true },
    });
  }

  async updateSchedule(id: string, dto: UpdateScheduleDto) {
    if (this.useInMemory) {
      return { id, ...dto };
    }
    return this.prisma.schedule.update({
      where: { id },
      data: dto,
      include: { foodTruck: true },
    });
  }

  async deleteSchedule(id: string) {
    if (this.useInMemory) {
      return { success: true };
    }
    return this.prisma.schedule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ===== TODAY'S SCHEDULES =====

  async getTodaySchedules() {
    const today = new Date().getDay(); // 0-6

    if (this.useInMemory) {
      return [
        {
          id: "1",
          locationName: "Marienplatz",
          address: "Marienplatz 1, 80331 München",
          latitude: 48.1374,
          longitude: 11.5755,
          dayOfWeek: today,
          startTime: "11:00",
          endTime: "20:00",
          foodTruck: {
            name: "München Street Eats",
            description: "Authentic Bavarian street food",
          },
        },
      ];
    }

    return this.prisma.schedule.findMany({
      where: {
        dayOfWeek: today,
        isActive: true,
      },
      include: { foodTruck: true, availability: true },
      orderBy: { startTime: "asc" },
    });
  }

  // ===== LOCATION-BASED SEARCH =====

  async findSchedulesNearLocation(dto: LocationSearchDto) {
    const radiusKm = dto.radiusKm || 5;

    if (this.useInMemory) {
      return [
        {
          id: "1",
          locationName: "Marienplatz",
          address: "Marienplatz 1, 80331 München",
          latitude: 48.1374,
          longitude: 11.5755,
          distance: 0.5,
          foodTruck: {
            name: "München Street Eats",
          },
        },
      ];
    }

    // Get all active schedules
    const schedules = await this.prisma.schedule.findMany({
      where: { isActive: true },
      include: { foodTruck: true },
    });

    // Calculate distance and filter
    const nearby = schedules
      .map((schedule) => {
        const distance = this.calculateDistance(
          dto.latitude,
          dto.longitude,
          schedule.latitude,
          schedule.longitude
        );
        return { ...schedule, distance };
      })
      .filter((s) => s.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  // Haversine formula for distance calculation
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // ===== AVAILABILITY MANAGEMENT =====

  async updateAvailability(scheduleId: string, dto: UpdateAvailabilityDto) {
    if (this.useInMemory) {
      return { scheduleId, ...dto };
    }

    const date = new Date(dto.date);

    // Check if availability record exists
    const existing = await this.prisma.locationAvailability.findFirst({
      where: {
        scheduleId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) {
      return this.prisma.locationAvailability.update({
        where: { id: existing.id },
        data: {
          isAvailable: dto.isAvailable,
          reason: dto.reason,
        },
      });
    }

    return this.prisma.locationAvailability.create({
      data: {
        scheduleId,
        date: new Date(dto.date),
        isAvailable: dto.isAvailable,
        reason: dto.reason,
      },
    });
  }

  async checkAvailability(scheduleId: string, date?: string) {
    const checkDate = date ? new Date(date) : new Date();

    if (this.useInMemory) {
      return { isAvailable: true, reason: null };
    }

    const availability = await this.prisma.locationAvailability.findFirst({
      where: {
        scheduleId,
        date: {
          gte: new Date(checkDate.setHours(0, 0, 0, 0)),
          lt: new Date(checkDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!availability) {
      return { isAvailable: true, reason: null };
    }

    return {
      isAvailable: availability.isAvailable,
      reason: availability.reason,
    };
  }

  // ===== FOOD TRUCK SCHEDULE =====

  async getFoodTruckSchedule(foodTruckId: string) {
    if (this.useInMemory) {
      return [];
    }

    return this.prisma.schedule.findMany({
      where: {
        foodTruckId,
        isActive: true,
      },
      include: { availability: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }
}
