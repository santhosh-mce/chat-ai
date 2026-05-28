import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import Image from "@/models/Image";

// Enhance prompt using OpenRouter
async function enhancePrompt(userInput: string): Promise<string> {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterApiKey) {
    console.warn("OPENROUTER_API_KEY not found, using user input as-is");
    return userInput;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          {
            role: "user",
            content: `Generate ONE ultra-realistic, detailed AI image generation prompt based on this description: "${userInput}"

Include:
- cinematic lighting and camera angle
- detailed textures and materials
- color palette and mood
- environment/background details
- realistic shadows, reflections, and depth

Only return the enhanced prompt text, nothing else.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return userInput;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return userInput; // Fallback to original input
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }

    // Enhance the prompt using OpenRouter
    const enhancedPrompt = await enhancePrompt(prompt.trim());
    console.log("Enhanced prompt:", enhancedPrompt);

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;

    console.log("Image URL:", imageUrl);

    // Verify the image can be generated/accessed with multiple retries
    let lastError: any = null;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds between retries
    let imageBuffer: ArrayBuffer | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to fetch image...`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout per attempt

        const response = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "image/png,image/jpeg,image/*",
          },
        });

        clearTimeout(timeout);

        // Check if response is valid
        if (response.ok && response.headers.get("content-type")?.includes("image")) {
          // Buffer the response to ensure image is fully available
          imageBuffer = await response.arrayBuffer();
          console.log(`✅ Image generated successfully on attempt ${attempt}`);
          console.log(`Image buffer size: ${imageBuffer.byteLength} bytes`);
          
          if (imageBuffer.byteLength < 1000) {
            throw new Error("Image too small, likely failed generation");
          }

          // Convert to base64 to avoid CORS issues
          const base64 = Buffer.from(imageBuffer).toString('base64');
          const contentType = response.headers.get("content-type") || "image/png";
          const dataUrl = `data:${contentType};base64,${base64}`;

          try {
            await connectDB();
            const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
              folder: "ai-images",
              resource_type: "image",
            });

            const savedImage = await Image.create({
              prompt: enhancedPrompt,
              imageUrl: uploadResponse.secure_url,
              publicId: uploadResponse.public_id,
            });

            return NextResponse.json({
              url: uploadResponse.secure_url,
              publicId: uploadResponse.public_id,
              imageId: savedImage._id,
              saved: true,
            });
          } catch (uploadError) {
            console.error("Cloudinary upload failed:", uploadError);
            return NextResponse.json({ url: dataUrl, saved: false });
          }
        }

        if (response.status === 502 || response.status === 503) {
          // Service temporarily unavailable, retry
          console.warn(`API returned ${response.status}, retrying...`);
          lastError = new Error(`Service temporarily unavailable (${response.status})`);
          
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
          }
        }

        throw new Error(`API returned status ${response.status}`);
      } catch (fetchError: any) {
        console.error(`Attempt ${attempt} failed:`, fetchError.message);
        lastError = fetchError;

        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, retryDelay));
        }
      }
    }

    // All retries failed
    if (lastError?.name === "AbortError") {
      return NextResponse.json(
        { error: "Image generation timeout - service took too long" },
        { status: 504 }
      );
    }

    console.error("Final error after retries:", lastError);
    return NextResponse.json(
      { error: lastError?.message || "Failed to generate image after multiple attempts" },
      { status: 503 }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
