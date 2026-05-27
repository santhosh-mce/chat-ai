import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Chat } from "@/models/Chat";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
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

    const chats = await Chat.find({ userId: decoded.id }).sort({ updatedAt: -1 });
    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const newChat = await Chat.create({
      userId: decoded.id,
      title: title || "New Chat",
    });

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
