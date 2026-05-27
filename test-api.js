const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function test() {
  const models = [
    "deepseek/deepseek-chat",
    "google/gemini-2.0-flash-exp",
    "openai/gpt-4o-mini",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "meta-llama/llama-3-8b-instruct:free",
    "openrouter/free"
  ];

  for (const model of models) {
    console.log(`Testing model: ${model}...`);
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 10
      });
      console.log(`✅ Success with ${model}: ${response.choices[0].message.content.trim()}`);
    } catch (err) {
      console.error(`❌ Failed with ${model}:`, err.message);
    }
  }
}

test();
