import React, { useState } from 'react';
import { Sidebar } from '../chat/sidebar';

interface ChatLayoutProps {
    children: React.ReactNode;
    setCurrentChatId: (id: string) => void;
    onNewChat: () => void;
}

export function ChatLayout({ children, setCurrentChatId, onNewChat }: ChatLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-[#fcfcf9] dark:bg-[#0a0a0a] text-[#1D1D1D] dark:text-[#E2E2E2] overflow-hidden font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onSelectChat={setCurrentChatId}
                onNewChat={onNewChat}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium opacity-60">Claude 3.5 Sonnet</span>
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                            S
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
