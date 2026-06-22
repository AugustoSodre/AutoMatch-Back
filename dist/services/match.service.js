"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMatches = getUserMatches;
exports.upsertMatch = upsertMatch;
exports.createMatch = createMatch;
exports.getMatchByUserAndCar = getMatchByUserAndCar;
exports.deleteMatch = deleteMatch;
exports.deleteMatchesByCarId = deleteMatchesByCarId;
const supabase_js_1 = __importDefault(require("../lib/supabase.js"));
function formatMatch(row) {
    return {
        id: row.id,
        car: {
            id: row.car.id,
            name: row.car.name,
            year: row.car.year,
            price: row.car.price,
            category: row.car.category,
            specs: {
                engine: row.car.engine,
                power: row.car.power,
                consumption: row.car.consumption,
                weight: row.car.weight,
            },
            costs: {
                ipva: row.car.ipva,
                insurance: row.car.insurance,
                maintenance: row.car.maintenance,
            },
            features: typeof row.car.features === "string" ? JSON.parse(row.car.features) : row.car.features,
            images: {
                main: row.car.main_image,
                thumbnails: typeof row.car.thumbnail_images === "string" ? JSON.parse(row.car.thumbnail_images) : row.car.thumbnail_images,
            },
        },
        savedAt: row.saved_at,
        matchPercentage: row.match_percentage,
    };
}
async function getUserMatches(userId) {
    const { data, error } = await supabase_js_1.default
        .from("saved_matches")
        .select("*, car:cars(*)")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });
    if (error) {
        console.error("[MatchService] getMatches error:", error);
        return [];
    }
    return (data || []).map(formatMatch);
}
async function upsertMatch(userId, carId, matchPercentage) {
    const { data, error } = await supabase_js_1.default
        .from("saved_matches")
        .upsert({
        user_id: userId,
        car_id: carId,
        match_percentage: matchPercentage,
    }, {
        onConflict: "user_id, car_id",
        ignoreDuplicates: false,
    })
        .select("*, car:cars(*)")
        .single();
    if (error) {
        console.error("[MatchService] upsertMatch error:", error);
        return null;
    }
    return formatMatch(data);
}
async function createMatch(userId, carId, matchPercentage) {
    const { data, error } = await supabase_js_1.default
        .from("saved_matches")
        .insert({
        user_id: userId,
        car_id: carId,
        match_percentage: matchPercentage,
    })
        .select("*, car:cars(*)")
        .single();
    if (error) {
        console.error("[MatchService] createMatch error:", error);
        return null;
    }
    return formatMatch(data);
}
async function getMatchByUserAndCar(userId, carId) {
    const { data, error } = await supabase_js_1.default
        .from("saved_matches")
        .select("*, car:cars(*)")
        .eq("user_id", userId)
        .eq("car_id", carId)
        .maybeSingle();
    if (error)
        return null;
    return data;
}
async function deleteMatch(matchId) {
    const { error } = await supabase_js_1.default
        .from("saved_matches")
        .delete()
        .eq("id", matchId);
    if (error) {
        console.error("[MatchService] deleteMatch error:", error);
        return false;
    }
    return true;
}
async function deleteMatchesByCarId(carId) {
    const { error } = await supabase_js_1.default
        .from("saved_matches")
        .delete()
        .eq("car_id", carId);
    if (error) {
        console.error("[MatchService] deleteMatchesByCarId error:", error);
        return false;
    }
    return true;
}
//# sourceMappingURL=match.service.js.map