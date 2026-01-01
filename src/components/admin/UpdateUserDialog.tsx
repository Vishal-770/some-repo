"use client";

import React, { useEffect } from "react";
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
import { UpdateUserForm, User } from "./types";

const updateUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  points: z.number().min(0, "Points must be non-negative"),
});

interface UpdateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdateUser: (data: UpdateUserForm) => Promise<void>;
}

export function UpdateUserDialog({
  isOpen,
  onOpenChange,
  user,
  onUpdateUser,
}: UpdateUserDialogProps) {
  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      name: "",
      points: 0,
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        name: user.name,
        points: user.points || 0,
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: UpdateUserForm) => {
    await onUpdateUser(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Update the user&apos;s information below.
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-user-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="update-email" className="text-right">
              Email *
            </Label>
            <div className="col-span-3">
              <Input
                id="update-email"
                type="email"
                {...form.register("email")}
                placeholder="user@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="update-name" className="text-right">
              Name *
            </Label>
            <div className="col-span-3">
              <Input
                id="update-name"
                {...form.register("name")}
                placeholder="Full name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="update-points" className="text-right">
              Points *
            </Label>
            <div className="col-span-3">
              <Input
                id="update-points"
                type="number"
                {...form.register("points", { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.points && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.points.message}
                </p>
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="update-user-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
