import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface MessageListProps {
    messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20">
                <div className="w-20 h-20 mb-8 flex items-center justify-center">
                    <img src="https://4say.site/claude.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-4xl font-serif font-medium text-text-200 mb-6 tracking-tight">
                    How can I help you today?
                </h1>
                <p className="text-gray-500 max-w-lg mb-12">
                    Ask me anything. I can help with coding, writing, learning, and more.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    role={message.role}
                    content={message.content}
                />
            ))}
            <div ref={bottomRef} className="h-32 shrink-0" />
        </div>
    );
}
