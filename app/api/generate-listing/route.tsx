import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are a marketplace listing assistant. Analyze this image and generate a listing.
              
Respond with ONLY a JSON object, no markdown, no explanation:
{
  "title": "concise product title (max 60 chars)",
  "description": "2-3 sentence compelling description mentioning key features, brand if visible, and any notable details",
  "category": "one of: Electronics, Sneakers, Clothing, Gaming, Home, Bags",
  "condition": "one of: New, Like New, Good, Fair",
  "price": a reasonable resale price as a number (no $ sign)
}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate listing" }, { status: 500 });
  }
}