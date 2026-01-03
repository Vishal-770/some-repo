"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { User } from "./types";

interface UnbanConfirmationDialogProps {
  user: User | null;
  isUnbanning: boolean;
  onConfirmUnban: (user: User) => void;
  onCancel: () => void;
}

export function UnbanConfirmationDialog({
  user,
  isUnbanning,
  onConfirmUnban,
  onCancel,
}: UnbanConfirmationDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={!!user} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Unban</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unban <strong>{user.name}</strong> (
            {user.email})? This will restore their access to the system
            immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirmUnban(user)}
            disabled={isUnbanning}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isUnbanning ? "Unbanning..." : "Unban User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
