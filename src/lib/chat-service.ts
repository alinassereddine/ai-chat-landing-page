import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase-config";
import type { Message, ChatListItem } from "./types";

class ChatService {
    private chatsCollection = collection(db, "chats");

    async createChat(firstMessage: string): Promise<string> {
        const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "");
        const chatDoc = await addDoc(this.chatsCollection, {
            title,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: firstMessage
        });
        return chatDoc.id;
    }

    async getRecentChats(): Promise<ChatListItem[]> {
        const q = query(this.chatsCollection, orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title
        }));
    }

    async saveMessage(chatId: string, message: Message) {
        const messagesCollection = collection(db, `chats/${chatId}/messages`);
        await addDoc(messagesCollection, {
            ...message,
            timestamp: serverTimestamp()
        });

        // Update chat last message and timestamp
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
            updatedAt: serverTimestamp(),
            lastMessage: message.content
        });
    }

    async getMessages(chatId: string): Promise<Message[]> {
        const messagesCollection = collection(db, `chats/${chatId}/messages`);
        const q = query(messagesCollection, orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.id,
                role: data.role,
                content: data.content
            } as Message;
        });
    }
}

export const chatService = new ChatService();
