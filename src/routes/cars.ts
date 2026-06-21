import { Router } from "express";
import * as carService from "../services/car.service.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const cars = await carService.getAllCars();
    res.json(cars);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const car = await carService.getCarById(req.params.id);

    if (!car) {
      res.status(404).json({ error: "Carro não encontrado" });
      return;
    }

    res.json(car);
  } catch (err) {
    next(err);
  }
});

export default router;
