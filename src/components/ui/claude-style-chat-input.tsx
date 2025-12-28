import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown, ArrowUp, X, FileText, Loader2, Check, Archive, Clock } from "lucide-react";
import type { AttachedFile, PastedContent, Model } from "@/lib/types";
import { AI_MODELS } from "@/lib/types";
import { cn } from "@/lib/utils";

/* --- ICONS --- */
const Icons = {
    Plus: Plus,
    Clock: Clock,
    SelectArrow: ChevronDown,
    ArrowUp: ArrowUp,
    X: X,
    FileText: FileText,
    Loader2: Loader2,
    Check: Check,
    Archive: Archive,
    Minimize: ChevronDown,
};

/* --- UTILS --- */
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* --- COMPONENTS --- */

interface FilePreviewCardProps {
    file: AttachedFile;
    onRemove: (id: string) => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/") && file.preview;

    return (
        <div className={`relative group flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50/50 animate-fade-in transition-all hover:border-text-400`}>
            {isImage ? (
                <div className="w-full h-full relative">
                    <img src={file.preview!} alt={file.file.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                </div>
            ) : (
                <div className="w-full h-full p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-200 rounded-lg">
                            <Icons.FileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                            {file.file.name.split('.').pop()}
                        </span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold text-gray-700 truncate" title={file.file.name}>
                            {file.file.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                            {formatFileSize(file.file.size)}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => onRemove(file.id)}
                className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-black/50 hover:bg-white rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
                <Icons.X className="w-3 h-3" />
            </button>
        </div>
    );
};

interface PastedContentCardProps {
    content: PastedContent;
    onRemove: (id: string) => void;
}

const PastedContentCard: React.FC<PastedContentCardProps> = ({ content, onRemove }) => {
    return (
        <div className="relative group flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-gray-100 bg-white animate-fade-in p-3 flex flex-col justify-between shadow-sm">
            <div className="overflow-hidden w-full">
                <p className="text-[10px] text-gray-400 leading-[1.4] font-mono break-words whitespace-pre-wrap line-clamp-4 select-none">
                    {content.content}
                </p>
            </div>
            <div className="flex items-center justify-between w-full mt-2">
                <div className="inline-flex items-center justify-center px-1.5 py-[2px] rounded border border-gray-100 bg-white">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">PASTED</span>
                </div>
            </div>
            <button
                onClick={() => onRemove(content.id)}
                className="absolute top-2 right-2 p-[3px] bg-white border border-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
            >
                <Icons.X className="w-2 h-2" />
            </button>
        </div>
    );
};

interface ModelSelectorProps {
    models: Model[];
    selectedModelId: string;
    onSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModelId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentModel = models.find(m => m.id === selectedModelId) || models[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1 transition-all px-2.5 py-1 rounded-xl active:scale-95
                ${isOpen
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
                <span className="text-[13px] font-medium">{currentModel.name}</span>
                <Icons.SelectArrow className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-[240px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col p-1.5 animate-fade-in origin-bottom-right max-h-80 overflow-y-auto custom-scrollbar">
                    {models.map(model => (
                        <button
                            key={model.id}
                            onClick={() => {
                                onSelect(model.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start justify-between group transition-colors hover:bg-gray-50`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-semibold text-gray-700">
                                        {model.name}
                                    </span>
                                    {model.badge && (
                                        <span className="px-1.5 py-[1px] rounded-full text-[10px] font-bold border border-blue-100 text-blue-500 bg-blue-50/50 uppercase">
                                            {model.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {model.provider}
                                </span>
                            </div>
                            {selectedModelId === model.id && (
                                <Icons.Check className="w-4 h-4 text-blue-500 mt-1" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export interface ClaudeChatInputProps {
    onSendMessage: (data: {
        message: string;
        files: AttachedFile[];
        pastedContent: PastedContent[];
        modelId: string;
        isThinkingEnabled: boolean
    }) => void;
    isLoading?: boolean;
    onMinimize?: () => void;
}

export const ClaudeChatInput: React.FC<ClaudeChatInputProps> = ({ onSendMessage, isLoading, onMinimize }) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<AttachedFile[]>([]);
    const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
    const [selectedModelId, setSelectedModelId] = useState(AI_MODELS[0].id);
    const [isThinkingEnabled] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + "px";
        }
    }, [message]);

    const handleFiles = useCallback((newFilesList: FileList | File[]) => {
        const newFiles = Array.from(newFilesList).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            type: file.type.startsWith('image/') ? 'image/unknown' : file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            uploadStatus: 'complete' as const
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    const handleSend = () => {
        if (!message.trim() && files.length === 0 && pastedContent.length === 0) return;
        if (isLoading) return;

        onSendMessage({
            message,
            files,
            pastedContent,
            modelId: selectedModelId,
            isThinkingEnabled
        });

        setMessage("");
        setFiles([]);
        setPastedContent([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasContent = (message.trim() || files.length > 0 || pastedContent.length > 0) && !isLoading;

    return (
        <div
            className="w-full max-w-3xl mx-auto font-sans"
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className={cn(
                "flex flex-col items-stretch transition-all duration-300 relative rounded-[32px] border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
                isLoading ? "border-gray-100 opacity-80" : "border-gray-200"
            )}>
                <div className="flex flex-col px-4 pt-4 pb-3 gap-3">
                    {/* Previews */}
                    {(files.length > 0 || pastedContent.length > 0) && (
                        <div className="flex gap-3 overflow-x-auto pb-2 px-1 custom-scrollbar">
                            {pastedContent.map(content => (
                                <PastedContentCard key={content.id} content={content} onRemove={(id) => setPastedContent(p => p.filter(c => c.id !== id))} />
                            ))}
                            {files.map(file => (
                                <FilePreviewCard key={file.id} file={file} onRemove={(id) => setFiles(f => f.filter(x => x.id !== id))} />
                            ))}
                        </div>
                    )}

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Reply..."
                        className="w-full bg-transparent border-0 outline-none text-[16px] text-gray-700 placeholder:text-gray-400 resize-none min-h-[24px] overflow-hidden py-1 leading-relaxed antialiased"
                        rows={1}
                        autoFocus
                    />

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
                                type="button"
                            >
                                <Icons.Plus size={20} />
                            </button>
                            <button
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
                                type="button"
                            >
                                <Icons.Clock size={19} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <ModelSelector
                                models={AI_MODELS}
                                selectedModelId={selectedModelId}
                                onSelect={setSelectedModelId}
                            />

                            <button
                                onClick={handleSend}
                                disabled={!hasContent}
                                className={cn(
                                    "flex items-center justify-center h-8 w-8 rounded-full transition-all active:scale-90 shadow-sm",
                                    hasContent
                                        ? "bg-[#D46B4F] text-white hover:bg-[#c15a3f]"
                                        : "bg-gray-100 text-gray-300"
                                )}
                            >
                                {isLoading ? (
                                    <Icons.Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Icons.ArrowUp size={18} strokeWidth={3} />
                                )}
                            </button>

                            {onMinimize && (
                                <button
                                    onClick={onMinimize}
                                    className="p-1 px-2 text-[10px] font-bold text-gray-300 hover:text-gray-400 transition-colors uppercase tracking-tighter"
                                >
                                    Hide
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />

            <p className="text-center text-[11px] text-gray-400/80 mt-3 font-medium">
                Claude is AI and can make mistakes. Please check important information.
            </p>
        </div>
    );
};

export default ClaudeChatInput;
