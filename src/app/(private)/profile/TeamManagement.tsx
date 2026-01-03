"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
  joinCode?: string;
  members: TeamMember[];
  teamleadId: string;
  teamleadName: string;
  points: number;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
  isTeamLead: boolean;
}

export default function TeamManagement() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [createTeamName, setCreateTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const fetchTeam = async () => {
    try {
      const response = await fetch("/api/teams/my-team");
      const data = await response.json();

      if (response.ok) {
        setTeam(data.team);
      } else {
        console.error("Error fetching team:", data.error);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateTeam = async () => {
    if (!createTeamName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: createTeamName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Team created successfully!");
        setTeam(data.team);
        setIsCreateDialogOpen(false);
        setCreateTeamName("");
        fetchTeam(); // Refresh team data
      } else {
        toast.error(data.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;

    setIsJoining(true);
    try {
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully joined team!");
        setIsJoinDialogOpen(false);
        setJoinCode("");
        fetchTeam(); // Refresh team data
      } else {
        toast.error(data.error || "Failed to join team");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    setIsLeaving(true);
    try {
      const response = await fetch("/api/teams/leave", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully left team!");
        setTeam(null);
        fetchTeam(); // Refresh team data
      } else {
        toast.error(data.error || "Failed to leave team");
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team");
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Loading team information...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>
          Create a new team or join an existing one to collaborate with others.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {team ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={team.isVerified ? "default" : "secondary"}>
                    {team.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {team.points} points
                  </span>
                </div>
              </div>
              {team.isTeamLead && (
                <div className="text-right">
                  <p className="text-sm font-medium">Join Code</p>
                  <p className="text-lg font-mono font-bold">{team.joinCode}</p>
                  {team.isVerified && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Team locked - no new members
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">
                Team Members ({team.members?.length || 0})
              </h4>
              <div className="space-y-2">
                {team.members && team.members.length > 0 ? (
                  team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      {member.id === team.teamleadId && (
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

            <Separator />

            <div className="flex gap-2">
              {team.isVerified && (
                <p className="text-sm text-muted-foreground">
                  This team is verified. Team changes are locked. Contact an
                  administrator for modifications.
                </p>
              )}
              {!team.isVerified && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLeaving}>
                      {isLeaving ? "Leaving..." : "Leave Team"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Team</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave this team? This action
                        cannot be undone.
                        {team.isTeamLead &&
                          " As the team lead, the team will be disbanded."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLeaveTeam}>
                        Leave Team
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You&apos;re not in a team yet. Create a new team or join an
              existing one.
            </p>

            <div className="flex gap-2">
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>Create Team</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a new team and become the team leader.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        placeholder="Enter team name"
                        value={createTeamName}
                        onChange={(e) => setCreateTeamName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={isCreating || !createTeamName.trim()}
                    >
                      {isCreating ? "Creating..." : "Create Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isJoinDialogOpen}
                onOpenChange={setIsJoinDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Join Team</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Team</DialogTitle>
                    <DialogDescription>
                      Enter the join code provided by your team leader.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="join-code">Join Code</Label>
                      <Input
                        id="join-code"
                        placeholder="Enter join code"
                        value={joinCode}
                        onChange={(e) =>
                          setJoinCode(e.target.value.toUpperCase())
                        }
                        maxLength={8}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleJoinTeam}
                      disabled={isJoining || !joinCode.trim()}
                    >
                      {isJoining ? "Joining..." : "Join Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
