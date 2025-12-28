export type AIProvider = 'anthropic' | 'openai' | 'google' | 'openrouter';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export interface AttachedFile {
    id: string;
    file: File;
    type: string;
    preview: string | null;
    uploadStatus: string;
    content?: string;
}

export interface PastedContent {
    id: string;
    content: string;
    timestamp: Date;
}

export interface Model {
    id: string;
    name: string;
    description: string;
    provider: AIProvider;
    badge?: string;
}

export const AI_MODELS: Model[] = [
    // Anthropic
    { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", provider: 'anthropic', description: "Most Capable", badge: "New" },
    { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", provider: 'anthropic', description: "Fastest" },
    { id: "claude-3-opus-latest", name: "Claude 3 Opus", provider: 'anthropic', description: "Deep Reasoning" },

    // OpenAI
    { id: "gpt-4o", name: "GPT-4o", provider: 'openai', description: "Omni model" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: 'openai', description: "Affordable & Fast" },
    { id: "o1-preview", name: "o1 Preview", provider: 'openai', description: "Reasoning model" },

    // Google
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: 'google', description: "Large Context" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: 'google', description: "Sub-second speed" },

    // OpenRouter (Examples)
    { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B", provider: 'openrouter', description: "Open weights giant" },
    { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: 'openrouter', description: "Superior coding" },
];

export interface Chat {
    id: string;
    title: string;
    createdAt: { seconds: number; nanoseconds: number } | null;
    updatedAt: { seconds: number; nanoseconds: number } | null;
    lastMessage?: string;
}

export interface ChatListItem {
    id: string;
    title: string;
}
