# Gemini Clone AI Chatbot

A modern, full-stack AI chatbot application inspired by Google Gemini, built with Next.js 15 App Router, Tailwind CSS, MongoDB, OpenRouter API, and Pollinations AI for image generation.

## Features
- 🚀 Next.js 15 App Router
- 🎨 Gemini-inspired dark mode glassmorphic UI
- 🤖 Multiple models via OpenRouter (DeepSeek, GPT-4o, Claude 3, Gemini 2.0)
- 🖼️ Instant Image Generation using Pollinations AI
- 💬 Chat History saved in MongoDB
- 🔒 JWT Authentication
- ✨ Framer Motion animations
- 📱 Responsive design

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your keys:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables
- `MONGODB_URI`: Your MongoDB connection string
- `OPENROUTER_API_KEY`: API Key from [OpenRouter](https://openrouter.ai/)
- `JWT_SECRET`: Random string for signing JWT tokens

## Deployment
This app can be easily deployed to Vercel. Ensure you add all environment variables in the Vercel dashboard.

## Prompts for Assets
- **Logo**: A minimalistic, glowing gradient spark symbol representing AI intelligence, dark background.
- **Landing Illustration**: Abstract 3D glassmorphic spheres and geometric shapes floating in a dark cyberpunk space.
- **Background Gradient**: Deep space blue to vibrant purple radial gradient mesh.
- **Loading Animation**: Futuristic glowing orbital rings spinning seamlessly in 3D space.
- **AI Chatbot Mascot**: A sleek, friendly glowing holographic robotic companion, 3D render, dark background.
