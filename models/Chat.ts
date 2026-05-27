import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, default: "New Chat" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
