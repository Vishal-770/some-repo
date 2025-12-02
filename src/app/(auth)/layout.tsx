import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth-server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
