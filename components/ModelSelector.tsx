"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const MODELS = [
  { id: "z-ai/glm-4.5-air:free", name: "Z.ai: GLM 4.5 Air (free)" },
  { id: "NVIDIA: Nemotron 3 Super (free)", name: "nvidia/nemotron-3-super-120b-a12b:free" },
  { id: "poolside/laguna-m.1:free", name: "Poolside: Laguna M.1 (free)" },
  { id: "openai/gpt-oss-120b:free", name: "OpenAI: gpt-oss-120b (free)" },
  { id: "poolside/laguna-xs.2:free", name: "Poolside: Laguna XS.2 (free)" },
  { id: "openai/gpt-oss-20b:free", name: "OpenAI: gpt-oss-20b (free)" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "NVIDIA: Nemotron 3 Nano 30B A3B (free)" },
  { id: "baidu/cobuddy:free", name: "Baidu Qianfan: CoBuddy (free)" },
  { id: "deepseek/deepseek-v4-flash:free", name: "DeepSeek: DeepSeek V4 Flash (free)" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "NVIDIA: Nemotron 3 Nano Omni (free)" },
  { id: "google/gemma-4-31b-it:free", name: "Google: Gemma 4 31B (free)" },
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "NVIDIA: Nemotron Nano 9B V2 (free)" },
  { id: "minimax/minimax-m2.5:free", name: "MiniMax: MiniMax M2.5 (free)" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "NVIDIA: Nemotron Nano 12B 2 VL (free)" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Google: Gemma 4 26B A4B (free)" },
  { id: "nvidia/llama-nemotron-embed-vl-1b-v2:free", name: "NVIDIA: Llama Nemotron Embed VL 1B V2 (free)" },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "LiquidAI: LFM2.5-1.2B-Thinking (free)" },
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen: Qwen3 Next 80B A3B Instruct (free)" },
  { id: "liquid/lfm-2.5-1.2b-instruct:free", name: "LiquidAI: LFM2.5-1.2B-Instruct (free)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Meta: Llama 3.3 70B Instruct (free)" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice: Uncensored (free)" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Meta: Llama 3.2 3B Instruct (free)" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Nous: Hermes 3 405B Instruct (free)" },
  { id: "qwen/qwen3-coder:free", name: "Qwen: Qwen3 Coder 480B A35B (free)" },
  { id: "alfredpros/codellama-7b-instruct-solidity", name: "AlfredPros: CodeLLaMa 7B Instruct Solidity" },
  { id: "openrouter/owl-alpha", name: "Owl Alpha" },

];

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export default function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-left text-sm font-medium text-gray-100 shadow-md shadow-black/30 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[80%]">{currentModel.name}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 z-30 mb-2 w-80 max-h-80 overflow-y-auto rounded-2xl border border-white/15 bg-[#181c24] shadow-2xl shadow-black/60 ring-1 ring-black/10 animate-fade-in">
            <div className="py-1">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm rounded-lg transition-colors duration-100
                    ${selectedModel === model.id
                      ? "bg-blue-500/10 text-blue-400 font-semibold ring-1 ring-blue-400/30"
                      : "text-gray-200 hover:bg-white/5 hover:text-white"}
                  `}
                  tabIndex={0}
                  aria-selected={selectedModel === model.id}
                  role="option"
                >
                  <span className="truncate">{model.name}</span>
                  {selectedModel === model.id && (
                    <span className="ml-auto text-xs text-blue-400">Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
