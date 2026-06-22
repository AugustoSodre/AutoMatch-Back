import { CarRow, MatchFormatted, SavedMatchRow } from "../types/index.js";
export declare function getUserMatches(userId: string): Promise<MatchFormatted[]>;
export declare function upsertMatch(userId: string, carId: string, matchPercentage: number): Promise<MatchFormatted | null>;
export declare function createMatch(userId: string, carId: string, matchPercentage: number): Promise<MatchFormatted | null>;
export declare function getMatchByUserAndCar(userId: string, carId: string): Promise<(SavedMatchRow & {
    car: CarRow;
}) | null>;
export declare function deleteMatch(matchId: string): Promise<boolean>;
export declare function deleteMatchesByCarId(carId: string): Promise<boolean>;
//# sourceMappingURL=match.service.d.ts.map