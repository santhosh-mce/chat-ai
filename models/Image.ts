import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
