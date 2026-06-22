import { CarRow, CarFormatted } from "../types/index.js";
export declare function getAllCars(): Promise<CarFormatted[]>;
export declare function getCarById(id: string): Promise<CarFormatted | null>;
export declare function getCarRowById(id: string): Promise<CarRow | null>;
export declare function createCar(car: CarFormatted & {
    id: string;
}): Promise<CarFormatted | null>;
export declare function updateCar(id: string, car: Partial<CarFormatted>): Promise<CarFormatted | null>;
export declare function deleteCar(id: string): Promise<boolean>;
export declare function getAllCarsRaw(): Promise<CarRow[]>;
//# sourceMappingURL=car.service.d.ts.map