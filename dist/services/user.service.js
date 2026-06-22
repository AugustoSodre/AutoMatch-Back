"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileByEmail = getProfileByEmail;
exports.getProfileById = getProfileById;
exports.getAllUsers = getAllUsers;
exports.updateProfile = updateProfile;
exports.updateUserRole = updateUserRole;
const supabase_js_1 = __importDefault(require("../lib/supabase.js"));
async function getProfileByEmail(email) {
    const { data, error } = await supabase_js_1.default
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();
    if (error)
        return null;
    return data;
}
async function getProfileById(id) {
    const { data, error } = await supabase_js_1.default
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        console.error("[UserService] getProfileById error:", error);
        return null;
    }
    return data;
}
async function getAllUsers() {
    const { data, error } = await supabase_js_1.default
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        console.error("[UserService] getAllUsers error:", error);
        return [];
    }
    return data || [];
}
async function updateProfile(id, updates) {
    const { data, error } = await supabase_js_1.default
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    if (error) {
        console.error("[UserService] updateProfile error:", error);
        return null;
    }
    return data;
}
async function updateUserRole(id, role) {
    return updateProfile(id, { role });
}
//# sourceMappingURL=user.service.js.map