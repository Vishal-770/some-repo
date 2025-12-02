import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmailVerification } from "../services/SendEmail";
import { sendPasswordResetEmail } from "../services/SendPasswordResetEmail";

const client = new MongoClient(process.env.MONGODB_URI!, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});
await client.connect();
const db = client.db();

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmailVerification(user.email, user.name, url);
    },
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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

  // Use databaseHooks to handle unverified email takeover
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check if there's an existing unverified user with this email
          const existingUser = await db.collection("user").findOne({
            email: user.email,
            emailVerified: false,
          });

          if (existingUser) {
            // Delete the unverified account so the new user can register
            await db.collection("user").deleteOne({ _id: existingUser._id });
            // Also delete any associated sessions and accounts
            await db
              .collection("session")
              .deleteMany({ userId: existingUser._id.toString() });
            await db
              .collection("account")
              .deleteMany({ userId: existingUser._id.toString() });
          }

          // Return the user data wrapped in { data: user }
          return { data: user };
        },
      },
    },
  },
});
