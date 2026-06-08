import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, onSnapshot, addDoc, serverTimestamp, query } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface User {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: any;
  participants: string[];
}

 export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [lastMessages, setLastMessages] = useState<{[key: string]: ChatMessage}>({});

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUserName(user.displayName || "Admin");
        console.log("✅ User logged in:", user.uid);
      } else {
        setCurrentUserId("demo-admin");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let snapshot;
        let source = "unknown";
        
        try {
          console.log("📥 Trying to fetch from 'users' collection...");
          snapshot = await getDocs(collection(db, "users"));
          source = "users";
          console.log("✅ Fetched from 'users' collection:", snapshot.size, "documents");
        } catch (err) {
          console.log("⚠️ 'users' collection failed, trying 'Users'...", err);
          try {
            snapshot = await getDocs(collection(db, "Users"));
            source = "Users";
            console.log("✅ Fetched from 'Users' collection:", snapshot.size, "documents");
          } catch (err2) {
            console.log("⚠️ 'Users' collection also failed, trying other variations...", err2);
            // Try more collection name variants
            snapshot = await getDocs(collection(db, "customers"));
            source = "customers";
            console.log("✅ Fetched from 'customers' collection:", snapshot.size, "documents");
          }
        }

        const usersList: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("📄 Processing doc:", doc.id, "Name:", data.name, "Role:", data.role, "Full data:", data);
          usersList.push({
            id: doc.id,
            name: data.name || "Unknown User",
            email: data.email || "no-email@example.com",
            role: data.role || "buyer",
          });
        });

        console.log(`✅ Successfully loaded ${usersList.length} users from '${source}' collection`);
        console.log("Users loaded:", usersList);
        
        if (usersList.length === 0) {
          console.warn("⚠️ WARNING: No users found in Firestore! Check if collection has data.");
          alert(`⚠️ No users found in ${source} collection. Make sure data exists in Firestore.`);
        }
        
        setUsers(usersList);
      } catch (error) {
        console.error("❌ Error loading users from Firestore:", error);
        console.error("Full error details:", error);
        alert(`❌ Error loading users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Auto-select user from URL
  useEffect(() => {
    if (userIdParam) {
      console.log("📌 URL parameter received, userId:", userIdParam);
      console.log("📌 Total users available:", users.length);
      
      if (users.length > 0) {
        const user = users.find((u) => u.id === userIdParam);
        if (user) {
          console.log("✅ Auto-selected user from URL:", user.name);
          setSelectedUser(user);
        } else {
          console.warn("⚠️ User ID from URL not found in users list. Looking for:", userIdParam);
          console.log("Available user IDs:", users.map(u => u.id));
        }
      } else {
        console.log("⏳ Waiting for users to load...");
      }
    }
  }, [userIdParam, users]);

  // Filter users
  useEffect(() => {
    let filtered = users.filter((u) => u.id !== currentUserId);

    // Get current user's role
    const currentUser = users.find((u) => u.id === currentUserId);
    const currentUserRole = currentUser?.role;

    // Role-based filtering
    if (currentUserRole && currentUserRole !== "admin") {
      // If user is buyer or farmer, only show admin users
      filtered = filtered.filter((u) => u.role === "admin");
      console.log(`🔐 ${currentUserRole} can only see admin users. Filtered to ${filtered.length} admin(s)`);
    } else if (currentUserRole === "admin") {
      // If user is admin, show all users (except self)
      console.log(`🔐 Admin can see all users. Showing ${filtered.length} users`);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      console.log("🔍 Filtering for:", searchLower);
      filtered = filtered.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(searchLower);
        const roleMatch = u.role?.toLowerCase().includes(searchLower);
        const emailMatch = u.email?.toLowerCase().includes(searchLower);
        const matches = nameMatch || roleMatch || emailMatch;
        if (matches) {
          console.log(`✅ Match found: ${u.name} (${u.role}) - matches name:${nameMatch} role:${roleMatch} email:${emailMatch}`);
        }
        return matches;
      });
      console.log("📊 Filtered results:", filtered.length, "users");
    }

    setFilteredUsers(filtered);
  }, [users, search, currentUserId]);

  // Listen to all messages to track last message per user
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = onSnapshot(query(collection(db, "messages")), (snapshot) => {
      const lastMsgs: {[key: string]: ChatMessage} = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants?.includes(currentUserId)) {
          // Find the other user in the conversation
          const otherUserId = data.participants.find((id: string) => id !== currentUserId);
          if (otherUserId) {
            // Keep track of the most recent message
            const existing = lastMsgs[otherUserId];
            const timestamp = data.timestamp?.toDate?.() || new Date(0);
            const existingTime = existing?.timestamp?.toDate?.() || new Date(0);
            
            if (!existing || timestamp > existingTime) {
              lastMsgs[otherUserId] = {
                id: doc.id,
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                timestamp: data.timestamp,
                participants: data.participants,
              };
            }
          }
        }
      });

      setLastMessages(lastMsgs);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Listen to messages for selected user
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const unsubscribe = onSnapshot(query(collection(db, "messages")), (snapshot) => {
      const msgs: ChatMessage[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.participants?.includes(currentUserId) &&
          data.participants?.includes(selectedUser.id)
        ) {
          msgs.push({
            id: doc.id,
            senderId: data.senderId,
            senderName: data.senderName || "Unknown",
            message: data.message,
            timestamp: data.timestamp,
            participants: data.participants,
          });
        }
      });

      msgs.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeA - timeB;
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser, currentUserId]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser || !currentUserId) return;

    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: selectedUser.id,
        message: messageText,
        timestamp: serverTimestamp(),
        participants: [currentUserId, selectedUser.id],
      });
      setMessageText("");
    } catch (error) {
      console.error("❌ Send error:", error);
    } finally {
2    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* SIDEBAR */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Messages</h2>
          <input
            type="text"
            placeholder="Search by name or type 'buyer', 'farmer'..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {users.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {search ? `Found ${filteredUsers.length} of ${users.length}` : `${users.length} users available`}
            </p>
          )}
        </div>

        {/* Users */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results for "{search}"
            </div>
          ) : (
            filteredUsers.map((user) => {
              const lastMsg = lastMessages[user.id];
              const lastTime = lastMsg?.timestamp?.toDate?.() || new Date();
              const timeStr = lastMsg ? lastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const messagePreview = lastMsg?.message?.substring(0, 35) || 'No messages yet';
              
              return (
              <button
                key={user.id}
                onClick={() => {
                  console.log("👆 User clicked from list:", user.name, "ID:", user.id);
                  setSelectedUser(user);
                }}
                className={`w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-100 transition ${
                  selectedUser?.id === user.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {user.id}</p>
                  </div>
                  {lastMsg && <span className="text-xs text-gray-500 ml-2">{timeStr}</span>}
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{messagePreview}</p>
                <div className="flex gap-2">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded font-semibold ${
                      user.role === "farmer"
                        ? "bg-green-100 text-green-700"
                        : user.role === "buyer"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                    {user.email}
                  </span>
                </div>
              </button>
            );
            })
          )}
        </div>
      </div>

      {/* CHAT */}
      <div className="w-2/3 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h3 className="font-semibold text-gray-800">{selectedUser.name}</h3>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  selectedUser.role === "farmer"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {selectedUser.role.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded font-mono">
                  ID: {selectedUser.id}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded break-words ${
                        msg.senderId === currentUserId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {msg.timestamp
                          ? new Date(msg.timestamp.toDate?.() || msg.timestamp).toLocaleTimeString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a user to chat
          </div>
        )}
      </div>
    </div>
  );
}
