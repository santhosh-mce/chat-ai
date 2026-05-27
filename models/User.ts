import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional if using oauth
  createdAt: { type: Date, default: Date.now }
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
