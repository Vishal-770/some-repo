import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendPasswordResetEmail } from "../services/SendPasswordResetEmail";
import { admin, username } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI!, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});
await client.connect();
const db = client.db();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, user.name, url);
    },
  },

  database: mongodbAdapter(db),

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["email"],
    },
  },

  plugins: [
    username(),
    admin({
      adminUserIds: ["6954f2f145f3640d14e21623"],
    }),
  ],

  // Use databaseHooks to handle user creation
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Return the user data wrapped in { data: user }
          return { data: user };
        },
      },
    },
  },
});
