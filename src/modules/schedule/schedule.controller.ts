import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
} from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateFoodTruckDto,
  UpdateAvailabilityDto,
  LocationSearchDto,
} from "./dto";

@Controller()
export class ScheduleController {
  constructor(private readonly service: ScheduleService) { }

  @Get("/api/schedule/health")
  health() {
    return { ok: true, service: "schedule" };
  }

  // ===== FOOD TRUCK ENDPOINTS =====

  @Post("/api/food-trucks")
  createFoodTruck(@Body() dto: CreateFoodTruckDto) {
    return this.service.createFoodTruck(dto);
  }

  @Get("/api/food-trucks")
  getAllFoodTrucks() {
    return this.service.getAllFoodTrucks();
  }

  @Get("/api/food-trucks/:id")
  getFoodTruckById(@Param("id") id: string) {
    return this.service.getFoodTruckById(id);
  }

  @Get("/api/food-trucks/:id/schedule")
  getFoodTruckSchedule(@Param("id") id: string) {
    return this.service.getFoodTruckSchedule(id);
  }

  // ===== SCHEDULE ENDPOINTS =====

  @Post("/api/schedules")
  createSchedule(@Body() dto: CreateScheduleDto) {
    return this.service.createSchedule(dto);
  }

  @Get("/api/schedules")
  getAllSchedules() {
    return this.service.getAllSchedules();
  }

  @Get("/api/schedules/today")
  getTodaySchedules() {
    return this.service.getTodaySchedules();
  }

  @Get("/api/schedules/near")
  findSchedulesNearLocation(@Query() dto: LocationSearchDto) {
    // Convert query params to numbers
    const searchDto: LocationSearchDto = {
      latitude: parseFloat(dto.latitude as any),
      longitude: parseFloat(dto.longitude as any),
      radiusKm: dto.radiusKm ? parseFloat(dto.radiusKm as any) : 5,
    };
    return this.service.findSchedulesNearLocation(searchDto);
  }

  @Get("/api/schedules/:id")
  getScheduleById(@Param("id") id: string) {
    return this.service.getScheduleById(id);
  }

  @Put("/api/schedules/:id")
  updateSchedule(@Param("id") id: string, @Body() dto: UpdateScheduleDto) {
    return this.service.updateSchedule(id, dto);
  }

  @Delete("/api/schedules/:id")
  deleteSchedule(@Param("id") id: string) {
    return this.service.deleteSchedule(id);
  }

  // ===== AVAILABILITY ENDPOINTS =====

  @Post("/api/schedules/:id/availability")
  updateAvailability(
    @Param("id") id: string,
    @Body() dto: UpdateAvailabilityDto
  ) {
    return this.service.updateAvailability(id, dto);
  }

  @Get("/api/schedules/:id/availability")
  checkAvailability(@Param("id") id: string, @Query("date") date?: string) {
    return this.service.checkAvailability(id, date);
  }
}
