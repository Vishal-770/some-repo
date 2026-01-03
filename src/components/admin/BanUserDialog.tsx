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
  const [banExpiresIn, setBanExpiresIn] = useState(60 * 60 * 24 * 1); // 1 day in seconds

  if (!user) return null;

  const handleConfirm = () => {
    onConfirmBan(user.id, banReason, banExpiresIn);
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
            <Label htmlFor="banReason">Ban Reason</Label>
            <Input
              id="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason"
            />
          </div>
          <div>
            <Label htmlFor="banExpiresIn">Ban Duration (seconds)</Label>
            <Input
              id="banExpiresIn"
              type="number"
              value={banExpiresIn}
              onChange={(e) => setBanExpiresIn(Number(e.target.value))}
              placeholder="Enter duration in seconds"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Current: {banExpiresIn} seconds (
              {Math.floor(banExpiresIn / (60 * 60 * 24))} days)
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
