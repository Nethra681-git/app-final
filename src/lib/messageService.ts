import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp,
  QueryConstraint,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

export interface Message {
  id?: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  participants: string[];
  message: string;
  created_at: Timestamp | Date;
  read: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "farmer" | "buyer";
  status: string;
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSender?: string;
  unreadCount?: number;
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSender: string;
  participants: string[];
  unreadCount: number;
}

/**
 * Send a message to Firestore
 * Ensures messages are saved with participants array for two-way filtering
 */
export const sendMessage = async (
  senderId: string,
  senderName: string,
  receiverId: string,
  messageText: string
) => {
  if (!messageText.trim()) return null;

  try {
    const messagesCollection = collection(db, "messages");
    
    // Create sorted participants array for consistent querying
    const participants = [senderId, receiverId].sort();
    
    const docRef = await addDoc(messagesCollection, {
      sender_id: senderId,
      sender_name: senderName,
      receiver_id: receiverId,
      participants: participants,
      message: messageText.trim(),
      created_at: Timestamp.now(),
      read: false,
    });
    
    console.log("✅ Message sent with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time messages for a conversation
 * Fetches all messages where current user is a participant
 * Returns unsubscribe function to prevent memory leaks
 */
export const subscribeToMessages = (
  userId: string,
  onMessagesUpdate: (messages: Message[]) => void,
  otherUserId?: string
) => {
  if (!userId) {
    console.warn("User ID not provided to subscribeToMessages");
    return () => {};
  }

  try {
    const messagesCollection = collection(db, "messages");
    
    // Create query to fetch messages where user is a participant
    const queryConstraints: QueryConstraint[] = [
      where("participants", "array-contains", userId),
      orderBy("created_at", "asc")
    ];
    
    const q = query(messagesCollection, ...queryConstraints);
    
    // Subscribe to real-time updates with error handling
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = [];
        const messageIds = new Set<string>();
        
        snapshot.forEach((doc) => {
          // Prevent duplicates using Set
          if (messageIds.has(doc.id)) {
            console.warn("Duplicate message detected:", doc.id);
            return;
          }
          
          messageIds.add(doc.id);
          const data = doc.data();
          
          const msg: Message = {
            id: doc.id,
            sender_id: data.sender_id || '',
            sender_name: data.sender_name || 'Unknown',
            receiver_id: data.receiver_id || '',
            participants: data.participants || [],
            message: data.message || '',
            created_at: data.created_at || Timestamp.now(),
            read: data.read || false,
          };
          
          // If filtering by specific conversation, check here
          if (!otherUserId || msg.participants.includes(otherUserId)) {
            messages.push(msg);
          }
        });
        
        console.log(`📨 Loaded ${messages.length} messages`);
        onMessagesUpdate(messages);
      },
      (error) => {
        console.error("❌ Error listening to messages:", error);
        // Call with empty array on error to prevent hanging
        onMessagesUpdate([]);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error("❌ Error setting up message subscription:", error);
    return () => {};
  }
};

/**
 * Get conversation ID from two user IDs
 * Ensures consistent conversation ID regardless of user order
 */
export const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

/**
 * Mark message as read (optional enhancement)
 */
export const markMessageAsRead = async (messageId: string) => {
  try {
    // TODO: Implement update operation for read status
    console.log("📖 Marking message as read:", messageId);
  } catch (error) {
    console.error("❌ Error marking message as read:", error);
  }
};

/**
 * Get all users based on current user role
 * Admin can see all users (farmers + buyers)
 * Farmer/Buyer can only see Admin
 */
export const getChatUsers = async (
  currentUserId: string,
  currentUserRole: "admin" | "farmer" | "buyer"
): Promise<ChatUser[]> => {
  try {
    const usersCollection = collection(db, "users");
    const queryConstraints: QueryConstraint[] = [
      where("status", "==", "approved")
    ];
    
    const q = query(usersCollection, ...queryConstraints);
    const snapshot = await getDocs(q);
    
    let users: ChatUser[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const userId = doc.id;
      
      // Don't include current user in list
      if (userId === currentUserId) return;
      
      // Filter based on role
      if (currentUserRole === "admin") {
        // Admin sees all users (farmers + buyers)
        if (data.role === "farmer" || data.role === "buyer") {
          users.push({
            id: userId,
            name: data.name || "Unknown",
            email: data.email || "",
            role: data.role,
            status: data.status,
          });
        }
      } else {
        // Farmer/Buyer only see Admin
        if (data.role === "admin") {
          users.push({
            id: userId,
            name: data.name || "Unknown",
            email: data.email || "",
            role: data.role,
            status: data.status,
          });
        }
      }
    });
    
    return users;
  } catch (error) {
    console.error("❌ Error fetching chat users:", error);
    return [];
  }
};

/**
 * Get all conversations for a user with last message info
 * Returns conversations ordered by last message time
 */
export const subscribeToConversations = (
  userId: string,
  currentUserRole: "admin" | "farmer" | "buyer",
  onConversationsUpdate: (conversations: Conversation[]) => void
) => {
  try {
    const messagesCollection = collection(db, "messages");
    const usersCollection = collection(db, "users");
    
    // Subscribe to user messages
    const queryConstraints: QueryConstraint[] = [
      where("participants", "array-contains", userId),
      orderBy("created_at", "desc")
    ];
    
    const q = query(messagesCollection, ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const conversationMap = new Map<string, Conversation>();
        
        // Process messages to build conversation map
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Find other user in participants
          const otherUserId = data.participants.find(
            (p: string) => p !== userId
          );
          
          if (!otherUserId) return;
          
          // Only update if this is the latest message for this conversation
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              userName: data.sender_id === userId ? data.receiver_id : data.sender_id,
              userRole: "",
              lastMessage: data.message || "",
              lastMessageTime: data.created_at,
              lastMessageSender: data.sender_name || "",
              participants: data.participants || [],
              unreadCount: data.read ? 0 : 1,
            });
          }
        });
        
        // Fetch user details for each conversation
        const conversations: Conversation[] = [];
        
        for (const [otherUserId, conv] of conversationMap) {
          try {
            const userRef = doc(usersCollection, otherUserId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              
              // Apply role-based filtering
              let shouldInclude = false;
              if (currentUserRole === "admin") {
                shouldInclude = userData.role === "farmer" || userData.role === "buyer";
              } else {
                shouldInclude = userData.role === "admin";
              }
              
              if (shouldInclude) {
                conv.userName = userData.name || "Unknown";
                conv.userRole = userData.role;
                conversations.push(conv);
              }
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          }
        }
        
        // Sort by last message time (newest first)
        conversations.sort((a, b) => {
          const timeA = a.lastMessageTime?.seconds || 0;
          const timeB = b.lastMessageTime?.seconds || 0;
          return timeB - timeA;
        });
        
        console.log(`📋 Loaded ${conversations.length} conversations`);
        onConversationsUpdate(conversations);
      },
      (error) => {
        console.error("❌ Error listening to conversations:", error);
        onConversationsUpdate([]);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error("❌ Error setting up conversation subscription:", error);
    return () => {};
  }
};
