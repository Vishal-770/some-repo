import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { error, success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        user: ["create"],
      },
    },
    headers: await headers(),
  });
  if (error) {
    redirect("/error");
  }
  if (!success) {
    redirect("/unauthorized");
  }

  return <div>{children}</div>;
};

export default AdminLayout;
