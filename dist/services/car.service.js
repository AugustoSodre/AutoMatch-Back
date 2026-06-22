"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCars = getAllCars;
exports.getCarById = getCarById;
exports.getCarRowById = getCarRowById;
exports.createCar = createCar;
exports.updateCar = updateCar;
exports.deleteCar = deleteCar;
exports.getAllCarsRaw = getAllCarsRaw;
const supabase_js_1 = __importDefault(require("../lib/supabase.js"));
function formatCar(row) {
    return {
        id: row.id,
        name: row.name,
        year: row.year,
        price: row.price,
        category: row.category,
        specs: {
            engine: row.engine,
            power: row.power,
            consumption: row.consumption,
            weight: row.weight,
        },
        costs: {
            ipva: row.ipva,
            insurance: row.insurance,
            maintenance: row.maintenance,
        },
        features: row.features || [],
        images: {
            main: row.main_image,
            thumbnails: row.thumbnail_images || [],
        },
    };
}
async function getAllCars() {
    const { data, error } = await supabase_js_1.default
        .from("cars")
        .select("*")
        .order("name");
    if (error) {
        console.error("[CarService] getAllCars error:", error);
        return [];
    }
    return (data || []).map(formatCar);
}
async function getCarById(id) {
    const { data, error } = await supabase_js_1.default
        .from("cars")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        console.error("[CarService] getCarById error:", error);
        return null;
    }
    return formatCar(data);
}
async function getCarRowById(id) {
    const { data, error } = await supabase_js_1.default
        .from("cars")
        .select("*")
        .eq("id", id)
        .single();
    if (error)
        return null;
    return data;
}
async function createCar(car) {
    const { data, error } = await supabase_js_1.default
        .from("cars")
        .insert({
        id: car.id,
        name: car.name,
        year: car.year,
        price: car.price,
        category: car.category,
        engine: car.specs.engine,
        power: car.specs.power,
        consumption: car.specs.consumption,
        weight: car.specs.weight,
        ipva: car.costs.ipva,
        insurance: car.costs.insurance,
        maintenance: car.costs.maintenance,
        features: JSON.stringify(car.features),
        main_image: car.images.main,
        thumbnail_images: JSON.stringify(car.images.thumbnails),
    })
        .select()
        .single();
    if (error) {
        console.error("[CarService] createCar error:", error);
        return null;
    }
    return formatCar(data);
}
async function updateCar(id, car) {
    const updateData = {};
    if (car.name !== undefined)
        updateData.name = car.name;
    if (car.year !== undefined)
        updateData.year = car.year;
    if (car.price !== undefined)
        updateData.price = car.price;
    if (car.category !== undefined)
        updateData.category = car.category;
    if (car.specs) {
        if (car.specs.engine !== undefined)
            updateData.engine = car.specs.engine;
        if (car.specs.power !== undefined)
            updateData.power = car.specs.power;
        if (car.specs.consumption !== undefined)
            updateData.consumption = car.specs.consumption;
        if (car.specs.weight !== undefined)
            updateData.weight = car.specs.weight;
    }
    if (car.costs) {
        if (car.costs.ipva !== undefined)
            updateData.ipva = car.costs.ipva;
        if (car.costs.insurance !== undefined)
            updateData.insurance = car.costs.insurance;
        if (car.costs.maintenance !== undefined)
            updateData.maintenance = car.costs.maintenance;
    }
    if (car.features !== undefined)
        updateData.features = JSON.stringify(car.features);
    if (car.images) {
        if (car.images.main !== undefined)
            updateData.main_image = car.images.main;
        if (car.images.thumbnails !== undefined)
            updateData.thumbnail_images = JSON.stringify(car.images.thumbnails);
    }
    const { data, error } = await supabase_js_1.default
        .from("cars")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
    if (error) {
        console.error("[CarService] updateCar error:", error);
        return null;
    }
    return formatCar(data);
}
async function deleteCar(id) {
    const { error } = await supabase_js_1.default
        .from("cars")
        .delete()
        .eq("id", id);
    if (error) {
        console.error("[CarService] deleteCar error:", error);
        return false;
    }
    return true;
}
async function getAllCarsRaw() {
    const { data, error } = await supabase_js_1.default
        .from("cars")
        .select("*")
        .order("name");
    if (error) {
        console.error("[CarService] getAllCarsRaw error:", error);
        return [];
    }
    return data || [];
}
//# sourceMappingURL=car.service.js.map