import React, { useState } from 'react';
import { Sidebar } from '../chat/sidebar';
import { ChevronDown, Share } from 'lucide-react';

interface ChatLayoutProps {
    children: React.ReactNode;
    setCurrentChatId: (id: string) => void;
    onNewChat: () => void;
    chatTitle?: string;
    activeChatId?: string | null;
}

export function ChatLayout({ children, setCurrentChatId, onNewChat, chatTitle, activeChatId }: ChatLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-[#fcfcf9] dark:bg-[#0a0a0a] text-[#1D1D1D] dark:text-[#E2E2E2] overflow-hidden font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onSelectChat={setCurrentChatId}
                onNewChat={onNewChat}
                activeChatId={activeChatId}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        {/* Title Dropdown */}
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors group">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-md">
                                {chatTitle || "New conversation"}
                            </span>
                            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                            <Share size={14} />
                            <span>Share</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
