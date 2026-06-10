import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;
const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'https://app-finals.onrender.com';

console.log('🔧 Socket Service initialized with URL:', SOCKET_SERVER_URL);

// Message and conversation interfaces
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatUser {
  socketId: string;
  userId: string;
  role: 'admin' | 'farmer' | 'buyer';
  name: string;
  email: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSender: string;
  unreadCount: number;
  online?: boolean;
}

/**
 * Initialize Socket.io connection
 */
export const initSocket = (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    // If already connected, return existing socket
    if (socket?.connected) {
      console.log('✅ Socket already connected:', socket.id);
      resolve(socket);
      return;
    }

    console.log('🔄 Attempting to connect to Socket.io server at', SOCKET_SERVER_URL);
    console.log('⚠️ Note: Socket connection is optional. App will work with Firestore.');

    socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,  // Reduced from 10
      transports: ['websocket', 'polling'],
      upgrade: true,
      rejectUnauthorized: false,
    });

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ Socket.io connected successfully!');
      console.log('   Socket ID:', socket!.id);
      resolve(socket!);
    });

    // Connection error
    socket.on('connect_error', (error: Error) => {
      console.warn('⚠️ Socket connection error (this is optional):', error.message);
      console.log('📡 Using Firestore for real-time updates instead.');
      // Don't reject - socket is optional
      resolve(socket!);
    });

    // Other errors
    socket.on('error', (error: any) => {
      console.warn('⚠️ Socket.io error (optional):', error);
    });

    // Disconnected
    socket.on('disconnect', (reason: string) => {
      console.warn('⚠️ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket?.connect();
      }
    });

    // Connection timeout - fail gracefully
    setTimeout(() => {
      if (!socket?.connected) {
        console.warn('⚠️ Socket connection timeout - using Firestore instead');
        resolve(socket!);  // Resolve anyway, socket is optional
      }
    }, 5000);
  });
};

/**
 * Register user login - tell server this user is online
 */
export const registerUserLogin = (userData: {
  userId: string;
  role: string;
  name: string;
  email: string;
}) => {
  if (!socket?.connected) {
    console.error('❌ Socket not connected - cannot register user');
    return;
  }

  console.log('📝 Registering user login:', userData.name);
  socket.emit('user:login', userData);
};

/**
 * Send a message to another user
 */
export const sendMessage = (messageData: {
  senderUserId: string;
  receiverUserId: string;
  message: string;
  senderName: string;
  senderRole: string;
}) => {
  if (!socket?.connected) {
    console.error('❌ Cannot send message - socket not connected');
    return;
  }

  console.log('📤 Sending message to:', messageData.receiverUserId);
  socket.emit('message:send', messageData);
};

/**
 * Listen for incoming messages
 */
export const onMessageReceive = (callback: (message: ChatMessage) => void) => {
  if (!socket) {
    console.error('❌ Socket not initialized');
    return;
  }

  socket.on('message:receive', (message: ChatMessage) => {
    console.log('📥 Message received:', message);
    callback(message);
  });

  // Return unsubscribe function
  return () => {
    socket?.off('message:receive', callback);
  };
};

/**
 * Listen for message sent confirmation
 */
export const onMessageSent = (
  callback: (data: { id: string; timestamp: string; status: string }) => void
) => {
  if (!socket) {
    console.error('❌ Socket not initialized');
    return;
  }

  socket.on('message:sent', (data) => {
    console.log('✅ Message confirmed sent:', data.id);
    callback(data);
  });

  return () => {
    socket?.off('message:sent', callback);
  };
};

/**
 * Request chat history with another user
 */
export const requestChatHistory = (userId: string, otherUserId: string) => {
  if (!socket?.connected) {
    console.error('❌ Socket not connected - cannot request history');
    return;
  }

  console.log('📜 Requesting chat history with:', otherUserId);
  socket.emit('chat:history', { userId, otherUserId });
};

/**
 * Listen for chat history response
 */
export const onChatHistoryResponse = (
  callback: (data: { messages: ChatMessage[]; conversationId: string }) => void
) => {
  if (!socket) {
    console.error('❌ Socket not initialized');
    return;
  }

  socket.on('chat:history:response', (data) => {
    console.log('📬 Chat history received:', data.messages.length, 'messages');
    callback(data);
  });

  return () => {
    socket?.off('chat:history:response', callback);
  };
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = (senderUserId: string, receiverUserId: string) => {
  if (!socket?.connected) {
    console.error('❌ Socket not connected');
    return;
  }

  socket.emit('message:read', { senderUserId, receiverUserId });
};

/**
 * Listen for online users list
 */
export const onOnlineUsersUpdate = (callback: (users: ChatUser[]) => void) => {
  if (!socket) {
    console.error('❌ Socket not initialized');
    return;
  }

  socket.on('users:online', (users: ChatUser[]) => {
    console.log('👥 Online users updated:', users.length, 'users');
    callback(users);
  });

  return () => {
    socket?.off('users:online', callback);
  };
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket?.connected) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  const connected = socket?.connected || false;
  console.log('🔍 Socket connected?', connected);
  return connected;
};
