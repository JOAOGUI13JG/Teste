import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToday } from "@/lib/dateUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Settings() {
  const { toast } = useToast();
  const userId = 1; // Demo user
  
  // Get user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/users/' + userId],
    queryFn: () => 
      fetch(`/api/users/${userId}`)
        .then(res => res.json()),
  });

  // Form schema for nutrition targets
  const targetsSchema = z.object({
    calories: z.coerce.number().min(100, "Calories must be at least 100").max(10000),
    protein: z.coerce.number().min(10, "Protein must be at least 10g").max(500),
    carbs: z.coerce.number().min(10, "Carbs must be at least 10g").max(1000),
    fat: z.coerce.number().min(10, "Fat must be at least 10g").max(500)
  });

  // Initialize form
  const form = useForm<z.infer<typeof targetsSchema>>({
    resolver: zodResolver(targetsSchema),
    defaultValues: {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fat: 65
    }
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (userData?.dailyTargets) {
      form.reset({
        calories: userData.dailyTargets.calories,
        protein: userData.dailyTargets.protein,
        carbs: userData.dailyTargets.carbs,
        fat: userData.dailyTargets.fat
      });
    }
  }, [userData, form]);

  // Update targets mutation
  const updateTargets = useMutation({
    mutationFn: (values: z.infer<typeof targetsSchema>) => 
      apiRequest("PATCH", `/api/users/${userId}/targets`, values),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your nutrition targets have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/' + userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update targets: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: z.infer<typeof targetsSchema>) => {
    updateTargets.mutate(values);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        selectedDate={getToday()} 
        onDateChange={() => {}} 
      />
      
      <main className="flex-grow overflow-auto pb-16 md:pb-0">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Daily Nutrition Targets</CardTitle>
              <CardDescription>
                Set your daily nutrition goals to track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Calories (kcal)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Recommended: 2000-2500 for adults
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="protein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carbs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updateTargets.isPending}
                    >
                      {updateTargets.isPending ? "Saving..." : "Save Targets"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About CalTrack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                CalTrack is a nutrition tracking application to help you monitor your daily food intake and reach your nutrition goals.
              </p>
              <p className="text-gray-500">
                Version 1.0.0
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer activePage="settings" />
    </div>
  );
}
