import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatWindow } from '@/components/ChatWindow';
import {
  initSocket,
  registerUserLogin,
  sendMessage as sendChatMessage,
  onMessageReceive,
  onOnlineUsersUpdate,
  onChatHistoryResponse,
  requestChatHistory,
  ChatMessage,
  Conversation,
  ChatUser,
  disconnectSocket,
} from '@/lib/socketService';

const Chat = () => {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  const location = useLocation();

  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);

  // Store the pre-selected user from navigation state
  const preSelectedUser = (location.state as any)?.selectedUser;

  // Initialize Socket.io connection
  useEffect(() => {
    const initializeChat = async () => {
      if (!currentUser?.id) {
        return;
      }

      setLoading(true);

      try {
        // Initialize Socket.io (optional - will fall back to Firestore)
        console.log('🚀 Initializing chat for:', currentUser.name);
        await initSocket();

        // Register user login (optional)
        try {
          registerUserLogin({
            userId: currentUser.id,
            role: currentUser.role,
            name: currentUser.name,
            email: currentUser.email,
          });
          console.log('✅ Chat initialized with socket');
        } catch (socketError) {
          console.warn('⚠️ Socket registration failed, but app will work with Firestore:', socketError);
        }

        console.log('✅ Chat ready for:', currentUser.name);
      } catch (error) {
        console.warn('⚠️ Socket initialization failed:', error);
        console.log('📡 App will use Firestore for real-time updates');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [currentUser?.id]);

  // Listen for online users updates
  useEffect(() => {
    const unsubscribe = onOnlineUsersUpdate((users) => {
      setOnlineUsers(users);

      // Build conversations from online users based on role
      const newConversations: Conversation[] = [];

      if (currentUser?.role === 'admin') {
        // Admin sees all users (farmers + buyers)
        const eligibleUsers = users.filter(
          (u) => u.userId !== currentUser.id && (u.role === 'farmer' || u.role === 'buyer')
        );

        eligibleUsers.forEach((user) => {
          newConversations.push({
            userId: user.userId,
            userName: user.name,
            userRole: user.role,
            lastMessage: '',
            lastMessageTime: null,
            lastMessageSender: '',
            unreadCount: 0,
            online: true,
          });
        });
      } else {
        // Farmer/Buyer sees only admins
        const adminUsers = users.filter(
          (u) => u.userId !== currentUser?.id && u.role === 'admin'
        );

        adminUsers.forEach((user) => {
          newConversations.push({
            userId: user.userId,
            userName: user.name,
            userRole: user.role,
            lastMessage: '',
            lastMessageTime: null,
            lastMessageSender: '',
            unreadCount: 0,
            online: true,
          });
        });
      }

      setConversations(newConversations);

      // Auto-select pre-selected user from navigation state if provided
      if (preSelectedUser && !selectedConversation) {
        const foundConversation = newConversations.find(
          (conv) => conv.userId === preSelectedUser.userId
        );
        if (foundConversation) {
          setSelectedConversation(foundConversation);
          requestChatHistory(currentUser!.id, foundConversation.userId);
        }
      } else if (newConversations.length > 0 && !selectedConversation && !preSelectedUser) {
        // Auto-select first conversation if none selected and no pre-selected user
        setSelectedConversation(newConversations[0]);
        requestChatHistory(currentUser!.id, newConversations[0].userId);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.id, currentUser?.role, preSelectedUser, selectedConversation]);

  // Listen for incoming messages
  useEffect(() => {
    const unsubscribe = onMessageReceive((message) => {
      // Only add message if it's from selected conversation
      if (
        selectedConversation &&
        (message.senderId === selectedConversation.userId ||
          message.receiverId === selectedConversation.userId)
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Update conversation last message
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.userId === message.senderId || conv.userId === message.receiverId) {
              return {
                ...conv,
                lastMessage: message.message,
                lastMessageTime: new Date(),
                lastMessageSender: message.senderName,
              };
            }
            return conv;
          })
        );
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedConversation]);

  // Listen for chat history response
  useEffect(() => {
    const unsubscribe = onChatHistoryResponse((data) => {
      // Sort messages by timestamp
      const sortedMessages = data.messages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMessages(sortedMessages);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Handle sending message
  const handleSendMessage = () => {
    if (
      !messageInput.trim() ||
      !currentUser ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    setSending(true);
    const messageText = messageInput.trim();

    sendChatMessage({
      senderUserId: currentUser.id,
      receiverUserId: selectedConversation.userId,
      message: messageText,
      senderName: currentUser.name,
      senderRole: currentUser.role,
    });

    setMessageInput('');
    setSending(false);

    // Clear input and scroll to bottom (will happen automatically)
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // Clear messages while loading
    requestChatHistory(currentUser!.id, conversation.userId);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{t('login_to_place_orders')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full bg-background rounded-2xl overflow-hidden shadow-lg">
      {/* Sidebar */}
      <div className="w-80 border-r">
        <ChatSidebar
          conversations={conversations}
          onlineUsers={onlineUsers}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          onlineUsers={onlineUsers}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          messageInput={messageInput}
          onMessageInputChange={setMessageInput}
          onSendMessage={handleSendMessage}
          sending={sending}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Chat;
