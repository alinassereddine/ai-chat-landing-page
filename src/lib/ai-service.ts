import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import type { Message, AIProvider } from './types';

export interface CompletionOptions {
    model: string;
    provider: AIProvider;
    messages: Message[];
    onChunk: (chunk: string) => void;
}

class UniversalAIService {
    private openai: OpenAI | null = null;
    private anthropic: Anthropic | null = null;
    private gemini: GoogleGenerativeAI | null = null;

    constructor() {
        const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (openaiKey) {
            this.openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
        }
        if (anthropicKey) {
            this.anthropic = new Anthropic({ apiKey: anthropicKey, dangerouslyAllowBrowser: true });
        }
        if (geminiKey) {
            this.gemini = new GoogleGenerativeAI(geminiKey);
        }
    }

    async streamCompletion({ model, provider, messages, onChunk }: CompletionOptions) {
        switch (provider) {
            case 'openai':
                return this.streamOpenAI(model, messages, onChunk);
            case 'anthropic':
                return this.streamAnthropic(model, messages, onChunk);
            case 'google':
                return this.streamGemini(model, messages, onChunk);
            case 'openrouter':
                return this.streamOpenRouter(model, messages, onChunk);
            default:
                throw new Error(`Provider ${provider} not supported`);
        }
    }

    private async streamOpenAI(model: string, messages: Message[], onChunk: (chunk: string) => void) {
        if (!this.openai) throw new Error("OpenAI API key missing");

        const stream = await this.openai.chat.completions.create({
            model,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) onChunk(content);
        }
    }

    private async streamAnthropic(model: string, messages: Message[], onChunk: (chunk: string) => void) {
        if (!this.anthropic) throw new Error("Anthropic API key missing");

        const stream = await this.anthropic.messages.create({
            model,
            max_tokens: 4096,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            stream: true,
        });

        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                onChunk(event.delta.text);
            }
        }
    }

    private async streamGemini(model: string, messages: Message[], onChunk: (chunk: string) => void) {
        if (!this.gemini) throw new Error("Gemini API key missing");

        const genModel = this.gemini.getGenerativeModel({ model });
        const chat = genModel.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessageStream(lastMessage);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) onChunk(chunkText);
        }
    }

    private async streamOpenRouter(model: string, messages: Message[], onChunk: (chunk: string) => void) {
        const key = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!key) throw new Error("OpenRouter API key missing");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "HTTP-Referer": window.location.origin,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: true,
            })
        });

        if (!response.body) throw new Error("Failed to get readable stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.includes('[DONE]')) continue;
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices[0]?.delta?.content;
                        if (content) onChunk(content);
                    } catch (e) {
                        console.error("Error parsing OpenRouter chunk", e);
                    }
                }
            }
        }
    }
}

export const aiService = new UniversalAIService();
