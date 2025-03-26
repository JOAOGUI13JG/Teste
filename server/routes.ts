import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFoodItemSchema, 
  insertMealSchema, 
  insertMealItemSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id/targets", async (req: Request, res: Response) => {
    try {
      const targetsSchema = z.object({
        calories: z.number().positive(),
        protein: z.number().positive(),
        carbs: z.number().positive(),
        fat: z.number().positive()
      });
      
      const targets = targetsSchema.parse(req.body);
      const user = await storage.updateUserTargets(Number(req.params.id), targets);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update targets" });
    }
  });

  // Food items routes
  app.get("/api/food-items", async (_req: Request, res: Response) => {
    try {
      const foodItems = await storage.getFoodItems();
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get food items" });
    }
  });

  app.get("/api/food-items/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string || "";
      const foodItems = await storage.searchFoodItems(query);
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to search food items" });
    }
  });

  app.post("/api/food-items", async (req: Request, res: Response) => {
    try {
      const data = insertFoodItemSchema.parse(req.body);
      const foodItem = await storage.createFoodItem(data);
      res.status(201).json(foodItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  // Meal routes
  app.get("/api/users/:userId/meals", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date query parameter is required" });
      }
      
      const meals = await storage.getMeals(userId, date);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get meals" });
    }
  });

  app.get("/api/meals/:id", async (req: Request, res: Response) => {
    try {
      const meal = await storage.getMeal(Number(req.params.id));
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error) {
      res.status(500).json({ message: "Failed to get meal" });
    }
  });

  app.post("/api/meals", async (req: Request, res: Response) => {
    try {
      const data = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(data);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create meal" });
    }
  });

  app.patch("/api/meals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updateSchema = insertMealSchema.partial();
      const data = updateSchema.parse(req.body);
      const meal = await storage.updateMeal(id, data);
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update meal" });
    }
  });

  app.delete("/api/meals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteMeal(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Meal items routes
  app.post("/api/meal-items", async (req: Request, res: Response) => {
    try {
      const data = insertMealItemSchema.parse(req.body);
      const mealItem = await storage.createMealItem(data);
      res.status(201).json(mealItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create meal item" });
    }
  });

  app.patch("/api/meal-items/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const quantitySchema = z.object({ quantity: z.number().positive() });
      const { quantity } = quantitySchema.parse(req.body);
      const mealItem = await storage.updateMealItem(id, quantity);
      res.json(mealItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update meal item" });
    }
  });

  app.delete("/api/meal-items/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteMealItem(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal item" });
    }
  });

  // Daily data routes
  app.get("/api/users/:userId/daily", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      const dailyData = await storage.getDailyData(userId, date);
      res.json(dailyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily data" });
    }
  });

  // Weekly data routes
  app.get("/api/users/:userId/weekly", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
      
      const weeklyData = await storage.getWeeklyData(userId, endDate);
      res.json(weeklyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get weekly data" });
    }
  });

  // Default user creation for demo (if no users exist)
  const users = await storage.getUserByUsername("demo");
  if (!users) {
    await storage.createUser({
      username: "demo",
      password: "password", // In a real app, this would be hashed
      dailyTargets: {
        calories: 2000,
        protein: 120,
        carbs: 250,
        fat: 65
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
