import { Body, Controller, Get, Post, Param } from "@nestjs/common";
import { UscheduleService } from "./schedule.service";

@Controller()
export class UscheduleController {
  constructor(private readonly service: UscheduleService) {}

  @Get("/api/schedule/health")
  health() {
    return { ok: true, service: "schedule" };
  }

  @Get("/api/schedule")
  findAll() {
    return this.service.findAll();
  }

  @Get("/api/schedule/:id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post("/api/schedule")
  create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
