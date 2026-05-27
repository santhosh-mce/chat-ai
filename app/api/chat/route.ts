import { NextResponse } from "next/server";
import OpenAI from "openai";
import connectDB from "@/lib/db";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { verifyToken } from "@/lib/auth";

// Initialize OpenAI client for OpenRouter
function getOpenAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY not found in environment variables");
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  if (apiKey.includes("'") || apiKey.includes('"')) {
    console.error("❌ API key contains quotes - check .env file format");
    throw new Error("Invalid API key format");
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });
}

export async function POST(req: Request) {
  try {
    // Verify API key is configured
    let client;
    try {
      client = getOpenAIClient();
    } catch (error) {
      console.error("Client initialization error:", error);
      return NextResponse.json(
        { message: "Server configuration error: AI service not configured" },
        { status: 503 }
      );
    }

    await connectDB();
    const authHeader = req.headers.get("authorization");
    
    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded: any = verifyToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    const { messages, model, chatId } = await req.json();
    const selectedModel = model || "z-ai/glm-4.5-air:free";

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { message: "No messages provided" },
        { status: 400 }
      );
    }

    // Format messages for OpenRouter (OpenAI format)
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    console.log(`✓ Chat API: Using model ${selectedModel}, messages: ${messages.length}`);

    let response;
    try {
      response = await client.chat.completions.create({
        model: selectedModel,
        messages: formattedMessages,
        stream: true,
      });
    } catch (apiError: any) {
      console.error("❌ OpenRouter API Error:", apiError);
      const errorMessage = apiError?.error?.message || apiError?.message || "Failed to connect to AI service";
      return NextResponse.json(
        { message: `AI service error: ${errorMessage}` },
        { status: apiError?.status || 503 }
      );
    }

    // Save user message to DB if chatId is provided
    if (userId && chatId) {
      const userMessage = messages[messages.length - 1];
      try {
        await Message.create({
          chatId,
          role: "user",
          content: userMessage.content,
          model: selectedModel,
        });
        await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });
      } catch (dbError) {
        console.error("Error saving user message:", dbError);
        // Continue anyway - don't fail the response
      }
    }

    const encoder = new TextEncoder();
    let assistantMessageContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              assistantMessageContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          
          if (userId && chatId && assistantMessageContent) {
            try {
              await Message.create({
                chatId,
                role: "assistant",
                content: assistantMessageContent,
                model: selectedModel,
              });
            } catch (dbError) {
              console.error("Error saving assistant message:", dbError);
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("❌ Chat API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
