import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
    const isAssistant = role === 'assistant';

    return (
        <div className={cn(
            "w-full py-8 flex justify-center",
            isAssistant ? "bg-[#fcfcf9] dark:bg-[#0a0a0a]" : "bg-white dark:bg-[#0f0f0f]"
        )}>
            <div className="max-w-3xl w-full px-4 flex gap-6">
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    isAssistant ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-700"
                )}>
                    {isAssistant ? <Sparkles size={18} /> : <User size={18} />}
                </div>

                <div className="flex-1 min-w-0 prose dark:prose-invert max-w-none">
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
                                        className="rounded-lg !my-4"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={cn("bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm", className)} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            p({ children }) {
                                return <p className="mb-4 last:mb-0 leading-7 text-[#1D1D1D] dark:text-[#E2E2E2]">{children}</p>
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
