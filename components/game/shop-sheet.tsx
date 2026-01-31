"use client";

import { useGameStore } from '../../lib/store/game-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Coins, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { Item } from '../../lib/types/game';
import { useState } from 'react';

interface ShopSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
}

export function ShopSheet({ isOpen, onClose, items }: ShopSheetProps) {
  const { player, modifyCurrency, addItem, canAfford } = useGameStore();

  const handleBuy = (item: Item) => {
    if (canAfford(item.cost)) {
      modifyCurrency(-item.cost);
      addItem(item);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Wasteland Trader
          </SheetTitle>
          <SheetDescription>
            "Got some rare finds today, traveler. Standard rates."
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">{player.currency}</span>
            <span className="text-muted-foreground">Scrap</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-4">Available Items</h3>
          <div className="space-y-3">
            {items.map((item) => {
              const affordable = canAfford(item.cost);
              const alreadyOwned = player.inventory.some(i => i.id === item.id); // Simple check, could allow duplicates

              return (
                <div key={item.id} className="flex flex-col p-3 border rounded-md gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-secondary rounded capitalize">
                      {item.type}
                    </span>
                  </div>

                  {item.effect && (
                    <div className="text-xs text-green-500">
                      {Object.entries(item.effect).map(([stat, val]) => (
                        <span key={stat} className="mr-2 capitalize">
                          {stat}: +{val}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                      <Coins className="h-3 w-3" />
                      {item.cost}
                    </div>
                    <Button
                      size="sm"
                      disabled={!affordable}
                      onClick={() => handleBuy(item)}
                    >
                      {affordable ? 'Buy' : 'Too Expensive'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
