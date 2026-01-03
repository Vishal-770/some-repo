import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, username } from "better-auth/plugins";
import clientPromise from "./mongo";

const client = await clientPromise;
const db = client.db();

export const auth = betterAuth({
  // ================================
  // GOOGLE ONLY (NO EMAIL/PASSWORD)
  // ================================
  emailAndPassword: {
    enabled: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // ================================
  // DATABASE
  // ================================
  database: mongodbAdapter(db),

  // ================================
  // ACCOUNT LINKING
  // ================================
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  user: {
    additionalFields: {
      teamId: {
        type: "string",
        required: false,
        defaultValue: null,
      },
    },
  },
  // ================================
  // PLUGINS
  // ================================
  plugins: [
    username(),
    admin({
      adminUserIds: ["69595417cb4d43b7d9514a65", "695505fa2e31a93d2c16f33c"],
    }),
  ],
});
