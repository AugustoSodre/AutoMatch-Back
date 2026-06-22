import { ProfileRow } from "../types/index.js";
export declare function getProfileByEmail(email: string): Promise<ProfileRow | null>;
export declare function getProfileById(id: string): Promise<ProfileRow | null>;
export declare function getAllUsers(): Promise<ProfileRow[]>;
export declare function updateProfile(id: string, updates: Partial<ProfileRow>): Promise<ProfileRow | null>;
export declare function updateUserRole(id: string, role: "USER" | "ADMIN"): Promise<ProfileRow | null>;
//# sourceMappingURL=user.service.d.ts.map