"use client";

import { useGameStore } from '../../lib/store/game-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../ui/sheet';
import { Backpack, Coins } from 'lucide-react';
import { Button } from '../ui/button';

export function InventorySheet() {
  const { player, useItem } = useGameStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Backpack className="h-5 w-5" />
          {player.inventory.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Inventory</SheetTitle>
          <SheetDescription>
            Manage your equipment and resources.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">{player.currency}</span>
            <span className="text-muted-foreground">Scrap</span>
          </div>
        </div>

        <div className="mt-6 h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <h3 className="text-sm font-medium mb-4">Items ({player.inventory.length})</h3>
          {player.inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Your backpack is empty.</p>
          ) : (
            <div className="space-y-3">
              {player.inventory.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex flex-col p-3 border rounded-md gap-2">
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

                  {item.type === 'consumable' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full mt-1 h-7 text-xs"
                      onClick={() => useItem(item.id)}
                    >
                      Use Item
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent >
    </Sheet >
  );
}
