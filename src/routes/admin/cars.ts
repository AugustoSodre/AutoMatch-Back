import { Router } from "express";
import { z } from "zod";
import * as carService from "../../services/car.service.js";
import * as matchService from "../../services/match.service.js";
import { requireAdmin, AuthRequest } from "../../middleware/auth.js";
import { AppError } from "../../middleware/error.js";
import { getAuthClientFromRequest } from "../../lib/supabase.js";

const router = Router();

const carSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  year: z.number().int(),
  price: z.number().min(0),
  category: z.string().min(1, "Categoria é obrigatória"),
  specs: z.object({
    engine: z.string(),
    power: z.string(),
    consumption: z.string(),
    weight: z.string(),
  }),
  costs: z.object({
    ipva: z.number(),
    insurance: z.number(),
    maintenance: z.number(),
  }),
  features: z.array(z.string()),
  images: z.object({
    main: z.string(),
    thumbnails: z.array(z.string()),
  }),
});

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const authClient = getAuthClientFromRequest(req);
    const cars = await carService.getAllCars(authClient || undefined);
    res.json(cars);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const data = carSchema.parse(req.body);

    const existing = await carService.getCarById(data.id);
    if (existing) {
      throw new AppError(409, "Carro com este ID já existe");
    }

    const authClient = getAuthClientFromRequest(req);
    const car = await carService.createCar(data, authClient || undefined);

    if (!car) {
      throw new AppError(500, "Erro ao criar carro");
    }

    res.status(201).json(car);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const existing = await carService.getCarById(String(req.params.id));
    if (!existing) {
      throw new AppError(404, "Carro não encontrado");
    }

    const data = carSchema.omit({ id: true }).parse(req.body);

    const authClient = getAuthClientFromRequest(req);
    const car = await carService.updateCar(String(req.params.id), data, authClient || undefined);

    if (!car) {
      throw new AppError(500, "Erro ao atualizar carro");
    }

    res.json(car);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const existing = await carService.getCarById(String(req.params.id));
    if (!existing) {
      throw new AppError(404, "Carro não encontrado");
    }

    const authClient = getAuthClientFromRequest(req);
    await matchService.deleteMatchesByCarId(String(req.params.id), authClient || undefined);
    const deleted = await carService.deleteCar(String(req.params.id), authClient || undefined);

    if (!deleted) {
      throw new AppError(500, "Erro ao deletar carro");
    }

    res.status(204).send();
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
});

export default router;
