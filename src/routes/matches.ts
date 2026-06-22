import { Router } from "express";
import { z } from "zod";
import * as matchService from "../services/match.service.js";
import * as carService from "../services/car.service.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { getAuthClientFromRequest } from "../lib/supabase.js";

const router = Router();

const createMatchSchema = z.object({
  carId: z.string().min(1, "carId é obrigatório"),
  matchPercentage: z.number().min(0).max(100),
});

const recommendationsSchema = z.object({
  demographics: z.object({
    familySize: z.enum(["2", "3-4", "5+"] as const),
    primaryUse: z.string(),
    primaryEnvironment: z.string(),
  }),
  financials: z.object({
    maxBudget: z.number(),
  }),
  technicalPreferences: z.object({
    categories: z.array(z.enum(["Hatch", "Sedan", "SUV", "Picape", "Eletrico", "Premium"] as const)),
    vehicleAge: z.enum(["0km", "up_to_3_years", "up_to_10_years"] as const),
    transmission: z.string(),
  }),
  priorities: z.object({
    economy: z.number(),
    power: z.number(),
  }),
});

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const matches = await matchService.getUserMatches(req.userId!);
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

router.post("/recommendations", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userProfile = recommendationsSchema.parse(req.body);
    const userId = req.userId!;

    const cars = await carService.getAllCarsRaw();

    const formattedCars = cars.map(car => ({
      id: car.id,
      nome: car.name,
      ano: car.year,
      preco: car.price,
      categoria: car.category,
      specs: {
        potencia: car.power,
        consumo: car.consumption
      }
    }));

    const aiServiceUrl = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
    const response = await fetch(`${aiServiceUrl}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_profile: userProfile,
        available_cars: formattedCars
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Erro desconhecido na IA" }));
      throw new AppError(500, `IA Service Error: ${errorData.detail || response.statusText}`);
    }

    const aiResults = await response.json();

    const enrichedMatches: Awaited<ReturnType<typeof matchService.upsertMatch>>[] = [];

    if (aiResults.matches && aiResults.matches.length > 0) {
      const topMatches = aiResults.matches.slice(0, 1);

      const authClient = getAuthClientFromRequest(req);
      for (const aiMatch of topMatches) {
        try {
          const matchRecord = await matchService.upsertMatch(
            userId,
            aiMatch.id,
            Math.max(0, Math.round(aiMatch.match_score * 100)),
            authClient || undefined
          );

          if (matchRecord) {
            enrichedMatches.push(matchRecord);
          }
        } catch (saveErr) {
          console.error(`Erro ao salvar match automático para o carro ${aiMatch.id}:`, saveErr);
        }
      }
    }

    res.json({
      status: "success",
      matches: enrichedMatches,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createMatchSchema.parse(req.body);

    const car = await carService.getCarById(data.carId);

    if (!car) {
      throw new AppError(404, "Carro não encontrado");
    }

    const existing = await matchService.getMatchByUserAndCar(req.userId!, data.carId);

    if (existing) {
      throw new AppError(409, "Match já salvo");
    }

    const authClient = getAuthClientFromRequest(req);
    const match = await matchService.createMatch(
      req.userId!,
      data.carId,
      data.matchPercentage,
      authClient || undefined
    );

    if (!match) {
      throw new AppError(500, "Erro ao salvar match");
    }

    res.status(201).json(match);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const matchId = String(req.params.id);

    const matches = await matchService.getUserMatches(req.userId!);
    const match = matches.find(m => m.id === matchId);

    if (!match) {
      throw new AppError(404, "Match não encontrado");
    }

    const authClient = getAuthClientFromRequest(req);
    const deleted = await matchService.deleteMatch(matchId, authClient || undefined);

    if (!deleted) {
      throw new AppError(500, "Erro ao deletar match");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
