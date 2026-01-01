"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { User } from "./types";

const adjustPointsSchema = z.object({
  pointsChange: z.number().int("Points must be a whole number"),
});

interface AdjustPointsForm {
  pointsChange: number;
}

interface AdjustPointsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onAdjustPoints: (userId: string, pointsChange: number) => Promise<void>;
}

export function AdjustPointsDialog({
  isOpen,
  onOpenChange,
  user,
  onAdjustPoints,
}: AdjustPointsDialogProps) {
  const form = useForm<AdjustPointsForm>({
    resolver: zodResolver(adjustPointsSchema),
    defaultValues: {
      pointsChange: 0,
    },
  });

  const handleCustomAdjust = async (multiplier: number) => {
    const customAmount = form.getValues("pointsChange");
    if (!user || customAmount === 0) return;
    await onAdjustPoints(user.id, customAmount * multiplier);
    onOpenChange(false);
  };

  const handleQuickAdjust = async (amount: number) => {
    if (!user) return;
    await onAdjustPoints(user.id, amount);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Points</DialogTitle>
          <DialogDescription>
            Adjust the points for {user?.name}. Enter a custom amount and use +
            or - to apply it, or use quick adjust buttons.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-points" className="text-right">
              Current Points
            </Label>
            <div className="col-span-3">
              <Input
                id="current-points"
                value={user?.points || 0}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Adjust</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdjust(10)}
              >
                +10
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdjust(50)}
              >
                +50
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdjust(100)}
              >
                +100
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleQuickAdjust(-10)}
              >
                -10
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleQuickAdjust(-50)}
              >
                -50
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleQuickAdjust(-100)}
              >
                -100
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Custom Amount</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="points-change"
                type="number"
                {...form.register("pointsChange", { valueAsNumber: true })}
                placeholder="Enter amount"
                className="flex-1"
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleCustomAdjust(1)}
                disabled={
                  !form.watch("pointsChange") ||
                  form.watch("pointsChange") === 0
                }
              >
                +
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleCustomAdjust(-1)}
                disabled={
                  !form.watch("pointsChange") ||
                  form.watch("pointsChange") === 0
                }
              >
                -
              </Button>
            </div>
            {form.formState.errors.pointsChange && (
              <p className="text-sm text-destructive">
                {form.formState.errors.pointsChange.message}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
