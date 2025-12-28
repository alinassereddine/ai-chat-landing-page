import { useState } from 'react';
import type { Message, AttachedFile, PastedContent } from '@/lib/types';
import { AI_MODELS } from '@/lib/types';
import { ChatLayout } from './components/layout/chat-layout';
import { MessageList } from './components/chat/message-list';
import ClaudeChatInput from './components/ui/claude-style-chat-input';
import { aiService } from '@/lib/ai-service';
import { chatService } from '@/lib/chat-service';
import { Keyboard, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>("New conversation");
  const [isInputMinimized, setIsInputMinimized] = useState(false);

  const selectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    try {
      const history = await chatService.getMessages(chatId);
      setMessages(history);

      // Update title from recent chats list
      const chats = await chatService.getRecentChats();
      const activeChat = chats.find(c => c.id === chatId);
      if (activeChat) setChatTitle(activeChat.title);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setChatTitle("New conversation");
  };

  const handleSendMessage = async (data: {
    message: string;
    files: AttachedFile[];
    pastedContent: PastedContent[];
    modelId: string;
    isThinkingEnabled: boolean;
  }) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    let chatId = currentChatId;

    try {
      if (!chatId) {
        try {
          chatId = await chatService.createChat(data.message);
          setCurrentChatId(chatId);
          // Auto-set title for new chat
          setChatTitle(data.message.slice(0, 40) + (data.message.length > 40 ? "..." : ""));
        } catch (dbError) {
          console.error("Firestore Chat Creation Error:", dbError);
          chatId = 'temp-' + Date.now();
        }
      }

      chatService.saveMessage(chatId, userMessage).catch(err =>
        console.error("Firestore Save Message Error:", err)
      );

      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      };

      setMessages(prev => [...prev, assistantMessage]);

      const selectedModel = AI_MODELS.find(m => m.id === data.modelId) || AI_MODELS[0];

      let fullContent = "";
      await aiService.streamCompletion({
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages: updatedMessages,
        onChunk: (chunk) => {
          fullContent += chunk;
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent }
              : msg
          ));
        }
      });

      if (chatId && !chatId.startsWith('temp-')) {
        chatService.saveMessage(chatId, {
          ...assistantMessage,
          content: fullContent
        }).catch(err => console.error("Firestore Save AI Message Error:", err));
      }

    } catch (error) {
      console.error("Failed to get completion:", error);
      const errorMessage = "Error: Failed to connect to the AI provider. Please check your API keys.";

      setMessages(prev => {
        const existingAssistant = prev.find(m => m.role === 'assistant' && m.content === '');
        if (existingAssistant) {
          return prev.map(msg =>
            msg.id === existingAssistant.id
              ? { ...msg, content: errorMessage }
              : msg
          );
        }
        return [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMessage }];
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatLayout
      setCurrentChatId={selectChat}
      onNewChat={startNewChat}
      chatTitle={chatTitle}
      activeChatId={currentChatId}
    >
      <div className="flex-1 flex flex-col h-full h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} />
        </div>

        <AnimatePresence>
          {!isInputMinimized ? (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="p-4 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-20"
            >
              <ClaudeChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onMinimize={() => setIsInputMinimized(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute bottom-10 right-10 z-30"
            >
              <button
                onClick={() => setIsInputMinimized(false)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg transition-all active:scale-95 group border-2 border-teal-400/50 backdrop-blur-sm"
              >
                <Keyboard size={20} className="group-hover:animate-bounce" />
                <span className="font-semibold tracking-wide">Restore Chat Input</span>
                <ChevronUp size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ChatLayout>
  );
}

export default App;
