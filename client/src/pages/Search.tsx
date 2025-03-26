import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FoodItem } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, PlusCircle } from "lucide-react";
import { getToday } from "@/lib/dateUtils";
import AddFoodDialog from "@/components/AddFoodDialog";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
  
  const { data: foodItems, isLoading } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items/search', { q: searchQuery }],
    queryFn: () => 
      fetch(`/api/food-items/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json()),
    enabled: searchQuery.length > 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useQuery will automatically trigger due to queryKey change
  };

  const handleAddFood = (food: FoodItem) => {
    setSelectedFood(food);
    setShowAddFoodDialog(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header selectedDate={getToday()} onDateChange={() => {}} />
      
      <main className="flex-grow overflow-auto pb-16 md:pb-0">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Food Database</h1>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
          
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-lg shadow-sm animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {foodItems && foodItems.length > 0 ? (
                foodItems.map((food) => (
                  <Card key={food.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{food.name}</h3>
                          <p className="text-sm text-gray-500">
                            {food.servingSize} {food.servingUnit} | {food.calories} cal
                          </p>
                          <div className="flex text-xs text-gray-500 space-x-2">
                            <span>P: {food.protein}g</span>
                            <span>C: {food.carbs}g</span>
                            <span>F: {food.fat}g</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleAddFood(food)}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : searchQuery ? (
                <p className="text-center py-4 text-gray-500">
                  No foods found matching "{searchQuery}"
                </p>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  Enter a search term to find foods
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      
      {selectedFood && (
        <AddFoodDialog
          food={selectedFood}
          open={showAddFoodDialog}
          onClose={() => {
            setShowAddFoodDialog(false);
            setSelectedFood(null);
          }}
          userId={1} // Demo user
          date={getToday()}
        />
      )}
      
      <Footer activePage="search" />
    </div>
  );
}
