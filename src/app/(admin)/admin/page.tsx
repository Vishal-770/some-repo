"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import {
  SearchAndFilter,
  UserTable,
  Pagination,
  CreateUserDialog,
  UpdateUserDialog,
  AdjustPointsDialog,
  DeleteUserDialog,
  User,
  CreateUserForm,
  UpdateUserForm,
} from "@/src/components/admin";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchField, setSearchField] = useState<"email" | "name">("email");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [isAdjustPointsModalOpen, setIsAdjustPointsModalOpen] = useState(false);
  const [userToAdjustPoints, setUserToAdjustPoints] = useState<User | null>(
    null
  );

  const pageSize = 10;

  const fetchUsers = async (
    page: number,
    search?: string,
    field?: "email" | "name"
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          searchValue: search || undefined,
          searchField: field || "email",
          searchOperator: "contains",
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (error) {
        setError(error.message || "Failed to fetch users");
        return;
      }

      if (data) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchValue, searchField);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchValue, searchField);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateUser = async (data: CreateUserForm) => {
    try {
      const { data: newUser, error } = await authClient.admin.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });

      if (error) {
        toast.error(error.message || "Failed to create user");
        return;
      }

      if (newUser) {
        toast.success("User created successfully!");
        setIsCreateModalOpen(false);
        // Refresh the users list
        fetchUsers(currentPage, searchValue, searchField);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(true);
    try {
      const { data: deletedUser, error } = await authClient.admin.removeUser({
        userId: userId,
      });

      if (error) {
        toast.error(error.message || "Failed to delete user");
        return;
      }

      if (deletedUser) {
        toast.success("User deleted successfully!");
        setUserToDelete(null);
        // Refresh the users list
        fetchUsers(currentPage, searchValue, searchField);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserForm) => {
    if (!userToUpdate) return;

    try {
      const { data: updatedUser, error } = await authClient.admin.updateUser({
        userId: userToUpdate.id,
        data: {
          name: data.name,
          email: data.email,
          points: data.points,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to update user");
        return;
      }

      if (updatedUser) {
        toast.success("User updated successfully!");
        setIsUpdateModalOpen(false);
        setUserToUpdate(null);
        // Refresh the users list
        fetchUsers(currentPage, searchValue, searchField);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the user");
    }
  };

  const handleAdjustPoints = async (userId: string, pointsChange: number) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const newPoints = (user.points || 0) + pointsChange;
      if (newPoints < 0) {
        toast.error("Points cannot be negative");
        return;
      }

      const { data: updatedUser, error } = await authClient.admin.updateUser({
        userId: userId,
        data: {
          points: newPoints,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to adjust points");
        return;
      }

      if (updatedUser) {
        toast.success(`Points adjusted successfully! New points: ${newPoints}`);
        // Refresh the users list
        fetchUsers(currentPage, searchValue, searchField);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while adjusting points");
    }
  };

  const handleAdjustPointsClick = (user: User) => {
    setUserToAdjustPoints(user);
    setIsAdjustPointsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToUpdate(user);
    setIsUpdateModalOpen(true);
  };

  const handleViewSessions = (userId: string) => {
    window.location.href = `/admin/${userId}`;
  };

  const handleDeleteUserClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      // Refresh the page after sign out
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Manage and view all registered users in the system.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
              <CreateUserDialog
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreateUser={handleCreateUser}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <SearchAndFilter
            searchValue={searchValue}
            searchField={searchField}
            onSearchValueChange={setSearchValue}
            onSearchFieldChange={setSearchField}
            onSearch={handleSearch}
          />

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table */}
          <UserTable
            users={users}
            loading={loading}
            onEditUser={handleEditUser}
            onViewSessions={handleViewSessions}
            onAdjustPoints={handleAdjustPointsClick}
            onDeleteUser={handleDeleteUserClick}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Update User Dialog */}
      <UpdateUserDialog
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        user={userToUpdate}
        onUpdateUser={handleUpdateUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={userToDelete}
        isDeleting={isDeleting}
        onConfirmDelete={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Adjust Points Dialog */}
      <AdjustPointsDialog
        isOpen={isAdjustPointsModalOpen}
        onOpenChange={setIsAdjustPointsModalOpen}
        user={userToAdjustPoints}
        onAdjustPoints={handleAdjustPoints}
      />
    </div>
  );
};

export default UsersPage;
