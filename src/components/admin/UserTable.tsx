"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { User } from "./types";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onViewSessions: (userId: string) => void;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => void;
}

export function UserTable({
  users,
  loading,
  onViewSessions,
  onBanUser,
  onUnbanUser,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Ban Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role ?? "user"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.teamName ? (
                  <Badge variant="outline">{user.teamName}</Badge>
                ) : (
                  <span className="text-muted-foreground">No team</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell>
                {user.banned ? (
                  <div className="space-y-1">
                    <Badge variant="destructive">Banned</Badge>
                    {user.banExpires && (
                      <div className="text-xs text-muted-foreground">
                        Expires:{" "}
                        {new Date(user.banExpires).toLocaleDateString()}
                      </div>
                    )}
                    {user.banReason && (
                      <div className="text-xs text-muted-foreground">
                        Reason: {user.banReason}
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewSessions(user.id)}
                  >
                    View Sessions
                  </Button>
                  {user.banned ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onUnbanUser(user)}
                    >
                      Unban
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onBanUser(user)}
                    >
                      Ban
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
