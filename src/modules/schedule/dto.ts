export class CreateScheduleDto {
    foodTruckId: string;
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    dayOfWeek: number; // 0-6
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    specialEvent?: string;
}

export class UpdateScheduleDto {
    locationName?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isActive?: boolean;
    specialEvent?: string;
}

export class CreateFoodTruckDto {
    name: string;
    description?: string;
}

export class UpdateAvailabilityDto {
    date: string; // ISO date string
    isAvailable: boolean;
    reason?: string;
}

export class LocationSearchDto {
    latitude: number;
    longitude: number;
    radiusKm?: number; // default 5km
}
