"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { User } from "./types";

interface BanUserDialogProps {
  user: User | null;
  isBanning: boolean;
  onConfirmBan: (
    userId: string,
    banReason: string,
    banExpiresIn: number
  ) => void;
  onCancel: () => void;
}

export function BanUserDialog({
  user,
  isBanning,
  onConfirmBan,
  onCancel,
}: BanUserDialogProps) {
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState(1);
  const [banUnit, setBanUnit] = useState<"minutes" | "hours" | "days" | "weeks">("days");

  const getBanExpiresIn = () => {
    const multipliers = {
      minutes: 60,
      hours: 60 * 60,
      days: 60 * 60 * 24,
      weeks: 60 * 60 * 24 * 7,
    };
    return banDuration * multipliers[banUnit];
  };

  if (!user) return null;

  const handleConfirm = () => {
    onConfirmBan(user.id, banReason, getBanExpiresIn());
  };

  return (
    <Dialog open={!!user} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban the user <strong>{user.name}</strong> ({user.email}). This will
            prevent them from accessing the system.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="banReason" className="mb-2 block">Ban Reason</Label>
            <Input
              id="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason"
            />
          </div>
          <div>
            <Label className="mb-2 block">Ban Duration</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={banDuration}
                onChange={(e) => setBanDuration(Number(e.target.value))}
                placeholder="Enter duration"
                min="1"
                className="flex-1"
              />
              <Select value={banUnit} onValueChange={(value: "minutes" | "hours" | "days" | "weeks") => setBanUnit(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {getBanExpiresIn()} seconds ({banDuration} {banUnit})
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isBanning || !banReason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBanning ? "Banning..." : "Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
