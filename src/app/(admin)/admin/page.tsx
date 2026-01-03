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
  DeleteUserDialog,
  User,
} from "@/src/components/admin";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchField, setSearchField] = useState<"email" | "name">("email");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  }, [currentPage, searchValue, searchField]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchValue, searchField);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            onViewSessions={handleViewSessions}
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

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={userToDelete}
        isDeleting={isDeleting}
        onConfirmDelete={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};

export default UsersPage;
