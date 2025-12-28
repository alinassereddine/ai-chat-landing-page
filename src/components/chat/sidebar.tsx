import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Settings, Share2, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '@/lib/chat-service';
import type { ChatListItem } from '@/lib/types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
}

export function Sidebar({ isOpen, setIsOpen, onSelectChat, onNewChat }: SidebarProps) {
    const [recents, setRecents] = useState<ChatListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const chats = await chatService.getRecentChats();
                setRecents(chats);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchChats();
        }
    }, [isOpen]);

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="h-full bg-[#f7f7f3] dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0"
                >
                    <div className="p-4 flex flex-col h-full overflow-hidden">
                        {/* New Chat Button */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={onNewChat}
                                className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#e8e8e1] dark:bg-[#1a1a1a] hover:bg-[#dfdfd6] dark:hover:bg-[#252525] rounded-xl transition-colors text-sm font-medium text-text-200"
                            >
                                <Plus size={18} />
                                New Chat
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-600 block lg:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Sections */}
                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                            {/* Recents */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recents</span>
                                </div>
                                <nav className="flex flex-col gap-0.5">
                                    {loading ? (
                                        <div className="px-3 py-2 text-xs text-gray-400">Loading history...</div>
                                    ) : recents.length === 0 ? (
                                        <div className="px-3 py-2 text-xs text-gray-400">No recent chats</div>
                                    ) : (
                                        recents.map((chat) => (
                                            <button
                                                key={chat.id}
                                                onClick={() => onSelectChat(chat.id)}
                                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-start gap-3 group"
                                            >
                                                <MessageSquare size={16} className="mt-0.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="truncate font-medium">{chat.title}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </nav>
                            </div>

                            {/* Projects */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Projects</span>
                                    <Plus size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                                </div>
                                <div className="px-2 text-sm text-gray-400 italic">No projects yet</div>
                            </div>
                        </div>

                        {/* Bottom Menu */}
                        <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-sm transition-all group">
                                <Share2 size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                Share Feedback
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-sm transition-all group">
                                <Settings size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                Settings
                            </button>
                            <div className="px-3 py-3 mt-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-black">
                                    S
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate">Saify</div>
                                    <div className="text-[10px] text-gray-400 truncate uppercase tracking-tighter">Pro Plan</div>
                                </div>
                                <MoreHorizontal size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
