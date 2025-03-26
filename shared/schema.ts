import { pgTable, text, serial, integer, timestamp, json, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  dailyTargets: json("daily_targets").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>().default({
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65
  }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  dailyTargets: true,
});

// Food items
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  servingSize: real("serving_size").notNull(),
  servingUnit: text("serving_unit").notNull(),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
});

// Meals
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
});

// Meal items (linking meals and food items with quantity)
export const mealItems = pgTable("meal_items", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull(),
  foodItemId: integer("food_item_id").notNull(),
  quantity: real("quantity").notNull(),
});

export const insertMealItemSchema = createInsertSchema(mealItems).omit({
  id: true,
});

// Daily logs
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  totalCalories: real("total_calories").notNull(),
  totalProtein: real("total_protein").notNull(),
  totalCarbs: real("total_carbs").notNull(),
  totalFat: real("total_fat").notNull(),
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type MealItem = typeof mealItems.$inferSelect;
export type InsertMealItem = z.infer<typeof insertMealItemSchema>;

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;

// Extended types for API responses
export type MealWithItems = Meal & {
  items: (MealItem & { foodItem: FoodItem })[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export type DailyData = {
  date: string;
  meals: MealWithItems[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type WeeklyData = {
  dates: string[];
  calories: number[];
  target: number;
};
