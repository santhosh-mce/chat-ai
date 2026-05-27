"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageSquare, Image as ImageIcon, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-300">Gemini Clone is now live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Your Next-Gen <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Assistant
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10"
        >
          Experience the power of advanced AI models. Chat seamlessly, generate stunning images, and boost your productivity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/register" className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 justify-center">
            Get Started Free <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors flex items-center justify-center">
            Sign In
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-32 w-full text-left">
          {[
            { icon: MessageSquare, title: "Smart Conversations", desc: "Chat with state-of-the-art AI models including DeepSeek, GPT-4, and Claude." },
            { icon: ImageIcon, title: "Image Generation", desc: "Turn your imagination into reality with integrated Pollinations AI image generation." },
            { icon: Zap, title: "Lightning Fast", desc: "Built on Next.js 15 for incredible performance and streaming responses." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <feature.icon className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
