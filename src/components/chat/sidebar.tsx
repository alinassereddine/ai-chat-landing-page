import { useState, useEffect } from 'react';
import {
    Plus,
    MessageSquare,
    MoreHorizontal,
    Library,
    Archive,
    Info,
    LayoutGrid,
    Code,
    Folder,
    ChevronDown,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '@/lib/chat-service';
import type { ChatListItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    activeChatId?: string | null;
}

export function Sidebar({ isOpen, setIsOpen, onSelectChat, onNewChat, activeChatId }: SidebarProps) {
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
        <div className="flex h-full shrink-0 transition-all duration-300">
            {/* Slim Sidebar (Icon Bar) */}
            <aside className={cn(
                "h-full border-r border-gray-200 dark:border-gray-800 bg-[#f7f7f3] dark:bg-[#111111] flex flex-col items-center py-4 transition-all duration-300 z-30",
                isOpen ? "w-0 overflow-hidden border-none" : "w-[60px]"
            )}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 mb-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
                >
                    <PanelLeftOpen size={20} />
                </button>

                <div className="flex flex-col gap-4 mt-2">
                    <button
                        onClick={onNewChat}
                        className="p-2.5 bg-orange-100/50 hover:bg-orange-100 text-orange-700 rounded-xl transition-all shadow-sm active:scale-95"
                        title="New Chat"
                    >
                        <Plus size={22} strokeWidth={2.5} />
                    </button>

                    <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors" title="Library">
                        <Library size={20} />
                    </button>

                    <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors" title="Archive">
                        <Archive size={20} />
                    </button>
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors" title="Help">
                        <Info size={20} />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-black cursor-pointer shadow-md">
                        A
                    </div>
                </div>
            </aside>

            {/* Expanded Sidebar */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className="h-full bg-[#f7f7f3] dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 flex flex-col"
                    >
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Claude</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
                                >
                                    <PanelLeftClose size={20} />
                                </button>
                            </div>

                            <div className="px-4 mb-4">
                                <button
                                    onClick={onNewChat}
                                    className="w-full flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#1a1a1a] hover:bg-[#dfdfd6] dark:hover:bg-[#252525] rounded-xl transition-all text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98]"
                                >
                                    <Plus size={18} strokeWidth={2.5} className="text-orange-600" />
                                    New chat
                                </button>
                            </div>

                            {/* Main Navigation */}
                            <div className="px-2 space-y-1 mb-6">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[14px] font-medium transition-colors">
                                    <MessageSquare size={18} />
                                    Chats
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[14px] font-medium transition-colors">
                                    <LayoutGrid size={18} />
                                    Projects
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[14px] font-medium transition-colors">
                                    <Folder size={18} />
                                    Artifacts
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[14px] font-medium transition-colors">
                                    <Code size={18} />
                                    Code
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-8">
                                {/* Starred */}
                                <div>
                                    <div className="px-3 mb-2 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Starred</span>
                                    </div>
                                    <div className="space-y-1">
                                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 group">
                                            <Archive size={16} className="text-gray-400" />
                                            <div className="flex-1 truncate font-medium text-gray-600 dark:text-gray-400">CUSTOMER AND SUPPLIER ...</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Recents */}
                                <div>
                                    <div className="px-3 mb-2 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recents</span>
                                    </div>
                                    <nav className="flex flex-col gap-0.5">
                                        {loading ? (
                                            <div className="px-3 py-2 text-xs text-gray-400 animate-pulse">Loading history...</div>
                                        ) : recents.length === 0 ? (
                                            <div className="px-3 py-2 text-xs text-gray-400">No recent chats</div>
                                        ) : (
                                            recents.map((chat) => (
                                                <button
                                                    key={chat.id}
                                                    onClick={() => onSelectChat(chat.id)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-lg text-[14px] transition-all flex items-start justify-between group",
                                                        activeChatId === chat.id
                                                            ? "bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white"
                                                            : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className="truncate flex-1 font-medium">{chat.title}</div>
                                                    {activeChatId === chat.id && (
                                                        <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </nav>
                                </div>
                            </div>

                            {/* Profile Section */}
                            <div className="p-2 mt-auto border-t border-gray-200 dark:border-gray-800">
                                <button className="w-full flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all group">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-1 ring-black/5">
                                        A
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">Abdal</div>
                                        <div className="text-[10px] font-medium text-gray-500 uppercase">Free plan</div>
                                    </div>
                                    <div className="flex flex-col -gap-1">
                                        <ChevronUp size={10} className="text-gray-400" />
                                        <ChevronDown size={10} className="text-gray-400" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
