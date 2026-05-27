import mongoose, { Model, Schema } from "mongoose";

export interface IMessage {
  chatId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
  model?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  image: { type: String },
  model: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
