import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
    const isAssistant = role === 'assistant';

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className={cn(
            "w-full py-4 flex flex-col items-center",
            isAssistant ? "items-start sm:items-center" : "items-end"
        )}>
            <div className={cn(
                "max-w-3xl w-full px-4 sm:px-6 flex gap-4",
                isAssistant ? "flex-row" : "flex-row-reverse"
            )}>
                {/* AI Logo on the left for assistant */}
                {isAssistant && (
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center mt-1">
                        <svg viewBox="0 0 200 200" className="w-6 h-6 fill-[#D46B4F]">
                            <defs>
                                <ellipse id="petal" cx="100" cy="100" rx="90" ry="22" />
                            </defs>
                            <use href="#petal" transform="rotate(0 100 100)" />
                            <use href="#petal" transform="rotate(45 100 100)" />
                            <use href="#petal" transform="rotate(90 100 100)" />
                            <use href="#petal" transform="rotate(135 100 100)" />
                        </svg>
                    </div>
                )}

                <div className={cn(
                    "flex-1 min-w-0 flex flex-col",
                    isAssistant ? "items-start" : "items-end"
                )}>
                    {/* Content */}
                    <div className={cn(
                        "transition-all duration-200",
                        isAssistant
                            ? "w-full text-gray-800 dark:text-gray-200"
                            : "bg-[#f3f3ee] dark:bg-[#2a2a28] text-gray-800 dark:text-gray-200 px-5 py-3 rounded-[24px] shadow-sm max-w-fit"
                    )}>
                        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:border-none">
                            <ReactMarkdown
                                components={{
                                    code({ className, children, ...props }: { className?: string; children?: React.ReactNode; inline?: boolean }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const isInline = props.inline;
                                        return !isInline && match ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                className="rounded-xl !my-4 text-sm shadow-md"
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={cn("bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono", className)} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    p({ children }) {
                                        return <p className="mb-4 last:mb-0">{children}</p>
                                    }
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* AI Action Icons */}
                    {isAssistant && content && (
                        <div className="flex items-center gap-1 mt-3 ml-[-4px]">
                            <button
                                onClick={handleCopy}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                title="Copy"
                            >
                                <Copy size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Good response">
                                <ThumbsUp size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Bad response">
                                <ThumbsDown size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Retry">
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
