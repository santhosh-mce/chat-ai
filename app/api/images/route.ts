import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Image from "@/models/Image";

export async function GET() {
  try {
    await connectDB();
    const images = await Image.find({}).sort({ createdAt: -1 });
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, publicId } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing image id" }, { status: 400 });
    }

    await connectDB();
    const image = await Image.findById(id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    try {
      const cloudinary = (await import("@/lib/cloudinary")).default;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudErr) {
      console.error("Cloudinary delete warning:", cloudErr);
    }

    await Image.findByIdAndDelete(id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
