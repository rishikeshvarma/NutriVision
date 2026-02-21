"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FoodItem } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface RecognizedFoodDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  items: (Omit<FoodItem, 'id' | 'calories' | 'protein' | 'carbohydrates' | 'fat'> & { quantity: number; calories: number; protein: number; carbohydrates: number; fat: number; })[] | null;
  onLogMeal: (items: FoodItem[]) => void;
  mealName: string;
}

type EditableFoodItem = FoodItem & { quantity: number };

const emptyFoodItem: EditableFoodItem = { id: '', name: '', quantity: 1, calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

export default function RecognizedFoodDialog({ isOpen, setIsOpen, items, onLogMeal, mealName }: RecognizedFoodDialogProps) {
  const [editableItems, setEditableItems] = useState<EditableFoodItem[]>([]);

  useEffect(() => {
    if (items) {
      setEditableItems(items.map(item => ({ 
        ...item, 
        id: Math.random().toString(36).substr(2, 9) 
      })));
    }
  }, [items]);

  const handleUpdate = (id: string, field: keyof EditableFoodItem, value: string | number) => {
    setEditableItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, [field]: field === 'name' ? value : Number(value) || 0 } : item
      )
    );
  };

  const handleAddItem = () => {
    setEditableItems(currentItems => [...currentItems, { ...emptyFoodItem, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveItem = (id: string) => {
    setEditableItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  
  const handleLog = () => {
    const finalItems: FoodItem[] = editableItems.map(({ quantity, ...item }) => ({
        ...item,
        calories: item.calories * quantity,
        protein: item.protein * quantity,
        carbohydrates: item.carbohydrates * quantity,
        fat: item.fat * quantity
    }));
    onLogMeal(finalItems);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Log Your Meal</DialogTitle>
          <DialogDescription>Review the items detected by our AI. You can edit quantities, add, or remove items before logging.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-4 pr-4">
            {editableItems.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No items yet. Add one to get started!</p>
            )}
            {editableItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border">
                <div className="col-span-12 md:col-span-3">
                  <Label htmlFor={`name-${item.id}`}>Name</Label>
                  <Input id={`name-${item.id}`} value={item.name} onChange={(e) => handleUpdate(item.id, 'name', e.target.value)} />
                </div>
                 <div className="col-span-4 md:col-span-1">
                  <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
                  <Input id={`quantity-${item.id}`} type="number" value={item.quantity} onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label htmlFor={`calories-${item.id}`}>Calories</Label>
                  <Input id={`calories-${item.id}`} type="number" value={item.calories} onChange={(e) => handleUpdate(item.id, 'calories', e.target.value)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label htmlFor={`protein-${item.id}`}>Protein (g)</Label>
                  <Input id={`protein-${item.id}`} type="number" value={item.protein} onChange={(e) => handleUpdate(item.id, 'protein', e.target.value)} />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label htmlFor={`carbs-${item.id}`}>Carbs (g)</Label>
                  <Input id={`carbs-${item.id}`} type="number" value={item.carbohydrates} onChange={(e) => handleUpdate(item.id, 'carbohydrates', e.target.value)} />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <Label htmlFor={`fat-${item.id}`}>Fat (g)</Label>
                  <Input id={`fat-${item.id}`} type="number" value={item.fat} onChange={(e) => handleUpdate(item.id, 'fat', e.target.value)} />
                </div>
                <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter className="sm:justify-between items-center">
            <Button variant="outline" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <Button onClick={handleLog} className="bg-primary hover:bg-primary/90">
                Log {mealName || 'Meal'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
