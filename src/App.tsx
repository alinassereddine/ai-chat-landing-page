import { useState } from 'react';
import type { Message, AttachedFile, PastedContent } from '@/lib/types';
import { AI_MODELS } from '@/lib/types';
import { ChatLayout } from './components/layout/chat-layout';
import { MessageList } from './components/chat/message-list';
import ClaudeChatInput from './components/ui/claude-style-chat-input';
import { aiService } from '@/lib/ai-service';
import { chatService } from '@/lib/chat-service';

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat messages if a chatId is provided (e.g., from sidebar)
  // For now, we'll implement the switching logic here
  const selectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    const history = await chatService.getMessages(chatId);
    setMessages(history);
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSendMessage = async (data: {
    message: string;
    files: AttachedFile[];
    pastedContent: PastedContent[];
    modelId: string;
    isThinkingEnabled: boolean;
  }) => {
    let chatId = currentChatId;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message
    };

    // If it's a new chat, create it in Firestore first
    if (!chatId) {
      chatId = await chatService.createChat(data.message);
      setCurrentChatId(chatId);
    }

    // Save user message to Firestore
    await chatService.saveMessage(chatId, userMessage);

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: ''
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const selectedModel = AI_MODELS.find(m => m.id === data.modelId) || AI_MODELS[0];

      let fullContent = "";
      await aiService.streamCompletion({
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages: newMessages,
        onChunk: (chunk) => {
          fullContent += chunk;
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent }
              : msg
          ));
        }
      });

      // Save assistant message to Firestore once streaming is done
      await chatService.saveMessage(chatId, {
        ...assistantMessage,
        content: fullContent
      });

    } catch (error) {
      console.error("Failed to get completion:", error);
      const errorMessage = "Error: Failed to connect to the AI provider. Please check your API keys.";
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: errorMessage }
          : msg
      ));

      // Optionally save error message as well
      await chatService.saveMessage(chatId, {
        ...assistantMessage,
        content: errorMessage
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatLayout
      setCurrentChatId={selectChat}
      onNewChat={startNewChat}
    >
      <div className="flex-1 flex flex-col h-full h-screen overflow-hidden">
        <MessageList messages={messages} />
        <div className="p-4 bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-gray-800">
          <ClaudeChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </ChatLayout>
  );
}

export default App;
