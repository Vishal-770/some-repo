"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
  teamleadId: string;
  teamleadName: string;
  members: TeamMember[];
  points: number;
  isVerified: boolean;
  joinCode: string;
  createdAt: string;
}

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/admin/teams");
      const data = await response.json();

      if (response.ok) {
        setTeams(data.teams);
      } else {
        toast.error(data.error || "Failed to fetch teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleVerifyTeam = async (teamId: string, verify: boolean) => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/admin/teams/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId, isVerified: verify }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          verify ? "Team verified successfully" : "Team unverified successfully"
        );
        fetchTeams();
        setSelectedTeam(null);
      } else {
        toast.error(data.error || "Failed to update team verification");
      }
    } catch (error) {
      console.error("Error verifying team:", error);
      toast.error("Failed to update team verification");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Teams Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users and teams</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin">Users</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/admin/teams">Teams</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teams Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Team Lead</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Code</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No teams found
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.teamleadName}</TableCell>
                      <TableCell>{team.members?.length || 0} members</TableCell>
                      <TableCell>{team.points}</TableCell>
                      <TableCell>
                        <Badge
                          variant={team.isVerified ? "default" : "secondary"}
                        >
                          {team.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{team.joinCode}</code>
                      </TableCell>
                      <TableCell>
                        {new Date(team.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTeam(team)}
                          >
                            View Details
                          </Button>
                          {!team.isVerified ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVerifyTeam(team.id, true)}
                              disabled={isVerifying}
                            >
                              Verify
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleVerifyTeam(team.id, false)}
                              disabled={isVerifying}
                            >
                              Unverify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Team Details Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name}</DialogTitle>
            <DialogDescription>Team details and members</DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Team Lead
                  </p>
                  <p>{selectedTeam.teamleadName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Points
                  </p>
                  <p>{selectedTeam.points}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={selectedTeam.isVerified ? "default" : "secondary"}
                  >
                    {selectedTeam.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Join Code
                  </p>
                  <code className="text-xs">{selectedTeam.joinCode}</code>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Team Members ({selectedTeam.members?.length || 0})
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTeam.members && selectedTeam.members.length > 0 ? (
                    selectedTeam.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                        {member.id === selectedTeam.teamleadId && (
                          <Badge variant="outline">Team Lead</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No members found
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTeam(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
