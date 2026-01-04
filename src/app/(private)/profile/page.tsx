import { getSession } from "@/src/lib/auth-server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Image from "next/image";

import TeamManagement from "./TeamManagement";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {user && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-lg">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Verified
                </label>
                <p className="mt-1 text-lg">
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
              {user.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="mt-1 rounded-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8">
            <TeamManagement user={user} />
          </div>
        </>
      )}
    </div>
  );
}
