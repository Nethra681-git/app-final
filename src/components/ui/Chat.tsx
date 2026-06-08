import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy
} from "firebase/firestore";

const Chat = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const currentUser = auth.currentUser;

  // 🔥 Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(data);
      console.log("Users:", data);
    };

    fetchUsers();
  }, []);

  // 🔥 Get URL userId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");

    if (userId && users.length > 0) {
      const found = users.find(u => u.id === userId);
      if (found) setSelectedUser(found);
    }
  }, [users]);

  // 🔥 Fetch Messages (Realtime)
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("created_at", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // filter only selected user chat
      const filtered = data.filter(
        msg =>
          msg.sender_id === selectedUser.id ||
          msg.receiver_id === selectedUser.id
      );

      setMessages(filtered);
    });

    return () => unsub();
  }, [selectedUser]);

  // 🔥 Send Message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    await addDoc(collection(db, "messages"), {
      sender_id: currentUser?.uid,
      receiver_id: selectedUser.id,
      participants: [currentUser?.uid, selectedUser.id],
      message: text,
      created_at: new Date()
    });

    setText("");
  };

  // 🔥 Filter Users
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT SIDE */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: 10 }}>
        
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />

        {filteredUsers.length === 0 ? (
          <p>No users found</p>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: 10,
                marginTop: 5,
                cursor: "pointer",
                background:
                  selectedUser?.id === user.id ? "#d1fae5" : "transparent"
              }}
            >
              <p><b>{user.name}</b></p>
              <small>{user.role}</small>
            </div>
          ))
        )}
      </div>

      {/* RIGHT SIDE */}
      <div style={{ width: "70%", padding: 10 }}>
        
        {!selectedUser ? (
          <p>Select a user to start chat</p>
        ) : (
          <>
            <h3>{selectedUser.name}</h3>

            <div style={{ height: "70vh", overflowY: "scroll" }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    textAlign:
                      msg.sender_id === currentUser?.uid ? "right" : "left",
                    margin: "10px 0"
                  }}
                >
                  <span
                    style={{
                      background: "#22c55e",
                      color: "white",
                      padding: 8,
                      borderRadius: 10
                    }}
                  >
                    {msg.message}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message..."
                style={{ flex: 1, padding: 10 }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;