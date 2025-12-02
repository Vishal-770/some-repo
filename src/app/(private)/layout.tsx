import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth-server";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  return <>{children}</>;
}
