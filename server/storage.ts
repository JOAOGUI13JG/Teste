import { 
  User, InsertUser, FoodItem, InsertFoodItem, 
  Meal, InsertMeal, MealItem, InsertMealItem,
  DailyLog, InsertDailyLog, MealWithItems, 
  DailyData, WeeklyData
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTargets(userId: number, targets: User['dailyTargets']): Promise<User>;

  // Food items operations
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  searchFoodItems(query: string): Promise<FoodItem[]>;

  // Meal operations
  getMeals(userId: number, date: string): Promise<MealWithItems[]>;
  getMeal(id: number): Promise<MealWithItems | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal>;
  deleteMeal(id: number): Promise<boolean>;

  // Meal items operations
  createMealItem(mealItem: InsertMealItem): Promise<MealItem>;
  updateMealItem(id: number, quantity: number): Promise<MealItem>;
  deleteMealItem(id: number): Promise<boolean>;

  // Daily logs operations
  getDailyLog(userId: number, date: string): Promise<DailyLog | undefined>;
  createOrUpdateDailyLog(log: InsertDailyLog): Promise<DailyLog>;
  getWeeklyData(userId: number, endDate: string): Promise<WeeklyData>;
  
  // Composite operations
  getDailyData(userId: number, date: string): Promise<DailyData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodItems: Map<number, FoodItem>;
  private meals: Map<number, Meal>;
  private mealItems: Map<number, MealItem>;
  private dailyLogs: Map<string, DailyLog>; // Key: userId-date
  
  private userId: number;
  private foodItemId: number;
  private mealId: number;
  private mealItemId: number;

  constructor() {
    this.users = new Map();
    this.foodItems = new Map();
    this.meals = new Map();
    this.mealItems = new Map();
    this.dailyLogs = new Map();
    
    this.userId = 1;
    this.foodItemId = 1;
    this.mealId = 1;
    this.mealItemId = 1;
    
    // Add default food items
    this.seedFoodItems();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserTargets(userId: number, targets: User['dailyTargets']): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, dailyTargets: targets };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Food items operations
  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const id = this.foodItemId++;
    const newFoodItem: FoodItem = { ...foodItem, id };
    this.foodItems.set(id, newFoodItem);
    return newFoodItem;
  }

  async searchFoodItems(query: string): Promise<FoodItem[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.foodItems.values()).filter(
      item => item.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Meal operations
  async getMeals(userId: number, date: string): Promise<MealWithItems[]> {
    const meals = Array.from(this.meals.values()).filter(
      meal => meal.userId === userId && meal.date === date
    );

    return Promise.all(meals.map(meal => this.getMeal(meal.id)).filter((meal): meal is MealWithItems => meal !== undefined));
  }

  async getMeal(id: number): Promise<MealWithItems | undefined> {
    const meal = this.meals.get(id);
    if (!meal) return undefined;

    const mealItems = Array.from(this.mealItems.values()).filter(
      item => item.mealId === id
    );

    const items = await Promise.all(
      mealItems.map(async item => {
        const foodItem = await this.getFoodItem(item.foodItemId);
        return { ...item, foodItem: foodItem! };
      })
    );

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    items.forEach(item => {
      totalCalories += item.foodItem.calories * item.quantity;
      totalProtein += item.foodItem.protein * item.quantity;
      totalCarbs += item.foodItem.carbs * item.quantity;
      totalFat += item.foodItem.fat * item.quantity;
    });

    return {
      ...meal,
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.mealId++;
    const newMeal: Meal = { ...meal, id };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  async updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal> {
    const existingMeal = this.meals.get(id);
    if (!existingMeal) throw new Error("Meal not found");
    
    const updatedMeal = { ...existingMeal, ...meal };
    this.meals.set(id, updatedMeal);
    return updatedMeal;
  }

  async deleteMeal(id: number): Promise<boolean> {
    // Delete associated meal items first
    const mealItemsToDelete = Array.from(this.mealItems.values()).filter(
      item => item.mealId === id
    );
    
    for (const item of mealItemsToDelete) {
      this.mealItems.delete(item.id);
    }
    
    return this.meals.delete(id);
  }

  // Meal items operations
  async createMealItem(mealItem: InsertMealItem): Promise<MealItem> {
    const id = this.mealItemId++;
    const newMealItem: MealItem = { ...mealItem, id };
    this.mealItems.set(id, newMealItem);
    
    // Update daily log
    await this.updateDailyLogFromMeals(
      (await this.getMeal(mealItem.mealId))!.userId,
      (await this.getMeal(mealItem.mealId))!.date
    );
    
    return newMealItem;
  }

  async updateMealItem(id: number, quantity: number): Promise<MealItem> {
    const mealItem = this.mealItems.get(id);
    if (!mealItem) throw new Error("Meal item not found");
    
    const updatedMealItem = { ...mealItem, quantity };
    this.mealItems.set(id, updatedMealItem);
    
    // Update daily log
    const meal = await this.getMeal(mealItem.mealId);
    if (meal) {
      await this.updateDailyLogFromMeals(meal.userId, meal.date);
    }
    
    return updatedMealItem;
  }

  async deleteMealItem(id: number): Promise<boolean> {
    const mealItem = this.mealItems.get(id);
    if (!mealItem) return false;
    
    // Update daily log after deletion
    const meal = await this.getMeal(mealItem.mealId);
    if (meal) {
      const result = this.mealItems.delete(id);
      await this.updateDailyLogFromMeals(meal.userId, meal.date);
      return result;
    }
    
    return this.mealItems.delete(id);
  }

  // Daily logs operations
  async getDailyLog(userId: number, date: string): Promise<DailyLog | undefined> {
    return this.dailyLogs.get(`${userId}-${date}`);
  }

  async createOrUpdateDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const id = this.dailyLogs.has(`${log.userId}-${log.date}`) 
      ? this.dailyLogs.get(`${log.userId}-${log.date}`)!.id
      : this.dailyLogs.size + 1;
    
    const dailyLog: DailyLog = { ...log, id };
    this.dailyLogs.set(`${log.userId}-${log.date}`, dailyLog);
    return dailyLog;
  }

  async updateDailyLogFromMeals(userId: number, date: string): Promise<DailyLog> {
    const meals = await this.getMeals(userId, date);
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    meals.forEach(meal => {
      totalCalories += meal.totalCalories;
      totalProtein += meal.totalProtein;
      totalCarbs += meal.totalCarbs;
      totalFat += meal.totalFat;
    });
    
    return this.createOrUpdateDailyLog({
      userId,
      date,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    });
  }

  async getWeeklyData(userId: number, endDate: string): Promise<WeeklyData> {
    const end = new Date(endDate);
    const dates: string[] = [];
    const calories: number[] = [];
    
    // Get the target calories for the user
    const user = await this.getUser(userId);
    const target = user?.dailyTargets.calories || 2000;
    
    // Generate the past 7 days including the end date
    for (let i = 6; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      
      const log = await this.getDailyLog(userId, dateStr);
      calories.push(log?.totalCalories || 0);
    }
    
    return { dates, calories, target };
  }

  // Composite operations
  async getDailyData(userId: number, date: string): Promise<DailyData> {
    const meals = await this.getMeals(userId, date);
    const user = await this.getUser(userId);
    
    if (!user) throw new Error("User not found");
    
    const dailyLog = await this.getDailyLog(userId, date) || {
      id: 0,
      userId,
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    };
    
    return {
      date,
      meals,
      totals: {
        calories: dailyLog.totalCalories,
        protein: dailyLog.totalProtein,
        carbs: dailyLog.totalCarbs,
        fat: dailyLog.totalFat
      },
      targets: user.dailyTargets
    };
  }

  // Seed data with default food items
  private seedFoodItems() {
    const defaultFoods: InsertFoodItem[] = [
      {
        name: "Oatmeal with banana",
        calories: 320,
        protein: 12,
        carbs: 38,
        fat: 8,
        servingSize: 250,
        servingUnit: "g"
      },
      {
        name: "Greek Yogurt",
        calories: 100,
        protein: 12,
        carbs: 4,
        fat: 10,
        servingSize: 100,
        servingUnit: "g"
      },
      {
        name: "Grilled Chicken Salad",
        calories: 420,
        protein: 38,
        carbs: 20,
        fat: 15,
        servingSize: 350,
        servingUnit: "g"
      },
      {
        name: "Whole Grain Bread",
        calories: 90,
        protein: 2,
        carbs: 14,
        fat: 1,
        servingSize: 40,
        servingUnit: "g"
      },
      {
        name: "Orange Juice",
        calories: 80,
        protein: 0,
        carbs: 10,
        fat: 5,
        servingSize: 200,
        servingUnit: "ml"
      },
      {
        name: "Salmon Fillet",
        calories: 250,
        protein: 19,
        carbs: 0,
        fat: 5,
        servingSize: 150,
        servingUnit: "g"
      },
      {
        name: "Steamed Vegetables",
        calories: 100,
        protein: 0,
        carbs: 20,
        fat: 0,
        servingSize: 200,
        servingUnit: "g"
      },
      {
        name: "Apple",
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        servingSize: 182,
        servingUnit: "g"
      },
      {
        name: "Almonds",
        calories: 160,
        protein: 6,
        carbs: 6,
        fat: 14,
        servingSize: 28,
        servingUnit: "g"
      },
      {
        name: "Brown Rice",
        calories: 215,
        protein: 5,
        carbs: 45,
        fat: 1.8,
        servingSize: 195,
        servingUnit: "g"
      }
    ];

    defaultFoods.forEach(food => {
      this.createFoodItem(food);
    });
  }
}

export const storage = new MemStorage();
