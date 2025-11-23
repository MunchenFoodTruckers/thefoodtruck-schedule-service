import { Module } from "@nestjs/common";
import { UscheduleController } from "./schedule.controller";
import { UscheduleService } from "./schedule.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [UscheduleController],
  providers: [UscheduleService, PrismaService],
  exports: [UscheduleService]
})
export class UscheduleModule {}
