import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    
    const chat = await Chat.findOne({ _id: id, userId: decoded.id });
    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    const messages = await Message.find({ chatId: id }).sort({ createdAt: 1 });

    return NextResponse.json({ chat, messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;

    const chat = await Chat.findOne({ _id: id, userId: decoded.id });
    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    await Chat.deleteOne({ _id: id });
    await Message.deleteMany({ chatId: id });

    return NextResponse.json({ message: "Chat deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { title } = await req.json();
    const { id } = await params;

    const chat = await Chat.findOneAndUpdate(
      { _id: id, userId: decoded.id },
      { title, updatedAt: Date.now() },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
