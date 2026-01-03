import mongoose, { Schema, Document } from "mongoose";

interface UserRef {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

export interface Team extends Document {
  name: string;
  members: mongoose.Types.ObjectId[]; // Can be ObjectId strings or populated user objects
  createdAt: Date;
  updatedAt: Date;
  points: number;
  logoUrl?: string;
  teamleadId: mongoose.Types.ObjectId; // Can be ObjectId string or populated user object
  joinCode?: string;
  isVerified?: boolean;
}

export interface PopulatedTeam extends Document {
  name: string;
  members: UserRef[];
  createdAt: Date;
  updatedAt: Date;
  points: number;
  logoUrl?: string;
  teamleadId: UserRef;
  joinCode?: string;
  isVerified?: boolean;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  members: { type: [Schema.Types.ObjectId], default: [], ref: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  points: { type: Number, default: 0 },
  logoUrl: { type: String },
  joinCode: { type: String, unique: true, sparse: true },
  teamleadId: { type: Schema.Types.ObjectId, required: true, ref: "user" },

  isVerified: { type: Boolean, default: false },
});

const TeamModel =
  mongoose.models.Team || mongoose.model<Team>("Team", TeamSchema);
export default TeamModel;
