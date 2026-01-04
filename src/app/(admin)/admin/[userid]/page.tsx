"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
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
import { ArrowLeft, Clock, MapPin, Smartphone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  impersonatedBy?: string | null;
}

const UserSessionsPage = () => {
  const params = useParams();
  const userId = params.userid as string;

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState<boolean>(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState<boolean>(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  const fetchUserSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authClient.admin.listUserSessions({
        userId: userId,
      });

      if (error) {
        setError(error.message || "Failed to fetch user sessions");
        return;
      }

      if (data) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching user sessions");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserSessions();
    }
  }, [userId, fetchUserSessions]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  const getDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown device";

    if (userAgent.includes("Mobile")) return "Mobile";
    if (userAgent.includes("Tablet")) return "Tablet";
    return "Desktop";
  };

  const getBrowserInfo = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown browser";

    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown browser";
  };

  const confirmRevokeAllSessions = async () => {
    try {
      setRevokingAll(true);
      setConfirmRevokeAll(false);
      setError(null);

      const { error } = await authClient.admin.revokeUserSessions({
        userId: userId,
      });

      if (error) {
        setError(error.message || "Failed to revoke all sessions");
        toast.error("Failed to revoke all sessions");
        return;
      }

      toast.success("All sessions revoked successfully");
      // Refresh the sessions list
      await fetchUserSessions();
    } catch (err) {
      console.error(err);
      setError("An error occurred while revoking sessions");
      toast.error("An error occurred while revoking sessions");
    } finally {
      setRevokingAll(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessionToRevoke(sessionId);
  };

  const confirmRevokeSession = async () => {
    if (!sessionToRevoke) return;

    try {
      const sessionId = sessionToRevoke;
      setRevokingSession(sessionId);
      setSessionToRevoke(null);
      setError(null);

      // Find the session to get the token
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        setError("Session not found");
        toast.error("Session not found");
        return;
      }

      const { error } = await authClient.admin.revokeUserSession({
        sessionToken: session.token,
      });

      if (error) {
        setError(error.message || "Failed to revoke session");
        toast.error("Failed to revoke session");
        return;
      }

      toast.success("Session revoked successfully");
      // Refresh the sessions list
      await fetchUserSessions();
    } catch (err) {
      console.error(err);
      setError("An error occurred while revoking session");
      toast.error("An error occurred while revoking session");
    } finally {
      setRevokingSession(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">User Sessions</h1>
            <p className="text-muted-foreground">
              Active sessions for user: {userId}
            </p>
          </div>
        </div>
        <AlertDialog open={confirmRevokeAll} onOpenChange={setConfirmRevokeAll}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={revokingAll || sessions.length === 0}
              onClick={() => setConfirmRevokeAll(true)}
            >
              {revokingAll ? "Revoking..." : "Revoke All Sessions"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke all active sessions for this
                user? This action cannot be undone and will log the user out
                from all devices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRevokeAllSessions}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Revoke All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sessions List */}
      {!error && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  No active sessions found for this user.
                </p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      <CardTitle className="text-lg">
                        {getDeviceInfo(session.userAgent)} -{" "}
                        {getBrowserInfo(session.userAgent)}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isExpired(session.expiresAt)
                            ? "destructive"
                            : "default"
                        }
                      >
                        {isExpired(session.expiresAt) ? "Expired" : "Active"}
                      </Badge>
                      {!isExpired(session.expiresAt) && (
                        <AlertDialog
                          open={sessionToRevoke === session.id}
                          onOpenChange={(open) =>
                            !open && setSessionToRevoke(null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={revokingSession === session.id}
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              {revokingSession === session.id
                                ? "Revoking..."
                                : "Revoke"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke Session
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke this session?
                                The user will be logged out from this device.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={confirmRevokeSession}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  <CardDescription>Session ID: {session.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Expires</p>
                        <p
                          className={`text-sm ${
                            isExpired(session.expiresAt)
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(session.expiresAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {session.ipAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">IP Address</p>
                        <p className="text-sm text-muted-foreground">
                          {session.ipAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  {session.userAgent && (
                    <div>
                      <p className="text-sm font-medium mb-1">User Agent</p>
                      <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                        {session.userAgent}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSessionsPage;
