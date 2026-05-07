# WhatsApp-like Chat System - Implementation Guide

## Overview

This document provides a complete guide to the WhatsApp-like chat system implemented using:
- **Backend**: Express.js + Socket.io
- **Frontend**: React + TypeScript
- **Real-time Communication**: Socket.io WebSockets
- **Role-based Access Control**: Admin, Buyer, Farmer

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Quick Start](#quick-start)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [API Endpoints](#api-endpoints)
7. [Socket.io Events](#socketio-events)
8. [Role-based Access Rules](#role-based-access-rules)
9. [Usage Examples](#usage-examples)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Design

```
┌─────────────────────────┐
│   React Frontend        │
│ (Socket.io Client)      │
└────────────┬────────────┘
             │
             │ WebSocket
             ▼
┌─────────────────────────┐
│   Express + Socket.io   │
│   (Backend Server)      │
│                         │
│ • User Management       │
│ • Message Routing       │
│ • Online Status         │
│ • Message Storage       │
└─────────────────────────┘
```

### Component Architecture

**Frontend Components:**
- `Chat.tsx` - Main chat page (container)
- `ChatSidebar.tsx` - User list and conversations
- `ChatWindow.tsx` - Message display and input
- `socketService.ts` - Socket.io client wrapper

**Backend Files:**
- `server.js` - Express + Socket.io setup
- Socket handlers for real-time messaging

---

## Database Schema

### Message Model

```typescript
interface ChatMessage {
  id: string;                    // Unique message ID
  senderId: string;              // Sender user ID
  senderName: string;            // Sender name
  senderRole: string;            // Sender role (admin/farmer/buyer)
  receiverId: string;            // Receiver user ID
  message: string;               // Message content
  timestamp: string;             // ISO timestamp
  read: boolean;                 // Read status
}
```

### Conversation Model

```typescript
interface Conversation {
  userId: string;                // Other user ID
  userName: string;              // Other user name
  userRole: string;              // Other user role
  lastMessage: string;           // Last message preview
  lastMessageTime: Date;         // Timestamp of last message
  lastMessageSender: string;     // Who sent last message
  unreadCount: number;           // Unread messages count
  online?: boolean;              // Online status
}
```

### User Model (from existing store)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer' | 'buyer';
  status: 'pending' | 'approved' | 'rejected' | 'disabled';
  // ... other fields
}
```

---

## Quick Start

### Installation

#### 1. Install Backend Dependencies
```bash
cd server
npm install
# or if using bun
bun install
```

This installs:
- `socket.io` - WebSocket server
- `cors` - Cross-origin requests
- `express` - Web framework

#### 2. Install Frontend Dependencies
```bash
npm install
# or
bun install
```

This adds:
- `socket.io-client` - WebSocket client

#### 3. Environment Setup

Create `.env` file in server directory:
```env
PORT=5000
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

Create `.env.local` in frontend directory (if needed):
```env
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

#### Start Backend
```bash
cd server
npm run dev
# Output: 
# 🚀 Server is running successfully!
#    URL: http://localhost:5000
#    WebSocket: ws://localhost:5000
```

#### Start Frontend
```bash
npm run dev
# Output:
# VITE v5.x.x  ready in xxx ms
# 
# ➜  Local:   http://localhost:5173/
```

---

## Backend Setup

### Socket.io Server Configuration

File: `server/server.js`

```javascript
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

### Key Features

#### 1. User Registration
When a user logs in:
```javascript
socket.on('user:login', (userData) => {
  activeUsers.set(userId, {
    socketId: socket.id,
    userId,
    role,
    name,
    email,
  });
  broadcastOnlineUsers();
});
```

**What happens:**
- User is added to `activeUsers` map
- All clients get updated online users list
- Conversations are generated based on role

#### 2. Message Sending
```javascript
socket.on('message:send', (messageData) => {
  const { senderUserId, receiverUserId, message } = messageData;
  
  // Store message
  storeMessage(senderUserId, receiverUserId, messageObj);
  
  // Send to receiver if online
  io.to(receiver.socketId).emit('message:receive', msgObject);
  
  // Confirm to sender
  socket.emit('message:sent', { id, timestamp, status: 'sent' });
});
```

**Message Flow:**
```
Sender Message → Socket.io → Receiver Receives → Auto-read
   (Send)                         (Real-time)    (If online)
```

#### 3. Chat History
```javascript
socket.on('chat:history', (historyData) => {
  const { userId, otherUserId } = historyData;
  const messages = chatMessages.get(conversationId) || [];
  
  socket.emit('chat:history:response', {
    messages,
    conversationId,
  });
});
```

#### 4. Online Users Broadcasting
```javascript
function broadcastOnlineUsers() {
  const usersArray = Array.from(activeUsers.values());
  io.emit('users:online', usersArray);
}
```

---

## Frontend Setup

### Socket Service Wrapper

File: `src/lib/socketService.ts`

Provides a clean interface to Socket.io:

```typescript
// Initialize
await initSocket();

// Register login
registerUserLogin({
  userId: currentUser.id,
  role: currentUser.role,
  name: currentUser.name,
  email: currentUser.email,
});

// Send message
sendMessage({
  senderUserId: currentUser.id,
  receiverUserId: selectedUser.id,
  message: "Hello!",
  senderName: currentUser.name,
  senderRole: currentUser.role,
});

// Listen for messages
const unsubscribe = onMessageReceive((message) => {
  setMessages(prev => [...prev, message]);
});

// Cleanup
unsubscribe();
```

### Chat Component Integration

File: `src/pages/Chat.tsx`

**State Management:**
```typescript
const [conversations, setConversations] = useState<Conversation[]>([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
```

**Key Hooks:**
1. **Initialize Socket** - On component mount
2. **Listen for Online Users** - Update conversation list
3. **Listen for Incoming Messages** - Update message display
4. **Listen for Chat History** - Load messages on conversation select

---

## API Endpoints

### REST API Endpoints

#### 1. Get Chat Users
```http
GET /api/chat/users?userId=USER_ID&userRole=admin
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "socketId": "abc123",
      "userId": "farmer1",
      "role": "farmer",
      "name": "John Farmer",
      "email": "john@example.com"
    }
  ]
}
```

**Rules:**
- Admin: Sees all Farmers and Buyers
- Farmer/Buyer: Sees only Admins

#### 2. Get Chat History
```http
GET /api/chat/history/:userId/:otherUserId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "admin1_farmer1",
    "messages": [
      {
        "id": "msg_1",
        "senderId": "admin1",
        "senderName": "Admin User",
        "receiverId": "farmer1",
        "message": "Hello!",
        "timestamp": "2026-04-11T10:30:00Z",
        "read": true
      }
    ]
  }
}
```

#### 3. Get Online Users
```http
GET /api/chat/online-users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "socketId": "abc123",
      "userId": "admin1",
      "role": "admin",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  ],
  "count": 1
}
```

---

## Socket.io Events

### Client → Server Events

#### `user:login`
Sent when user opens chat page.
```typescript
socket.emit('user:login', {
  userId: 'farmer1',
  role: 'farmer',
  name: 'John Farmer',
  email: 'john@example.com',
});
```

#### `message:send`
Send a message to another user.
```typescript
socket.emit('message:send', {
  senderUserId: 'farmer1',
  receiverUserId: 'admin1',
  message: 'Hello Admin!',
  senderName: 'John Farmer',
  senderRole: 'farmer',
});
```

#### `chat:history`
Request chat history with a user.
```typescript
socket.emit('chat:history', {
  userId: 'farmer1',
  otherUserId: 'admin1',
});
```

#### `message:read`
Mark messages as read.
```typescript
socket.emit('message:read', {
  senderUserId: 'admin1',
  receiverUserId: 'farmer1',
});
```

### Server → Client Events

#### `users:online`
Broadcast list of online users (automatic).
```typescript
socket.on('users:online', (users) => {
  console.log('Online users:', users);
});
```

#### `message:receive`
Receive a message from another user.
```typescript
socket.on('message:receive', (message) => {
  console.log('New message:', message);
});
```

#### `message:sent`
Confirmation that message was sent.
```typescript
socket.on('message:sent', (data) => {
  console.log('Message sent:', data.id);
});
```

#### `chat:history:response`
Receive chat history.
```typescript
socket.on('chat:history:response', (data) => {
  console.log('Messages:', data.messages);
});
```

---

## Role-based Access Rules

### Admin Access

✅ **Can see:**
- All Farmers in chat list
- All Buyers in chat list
- Messages from any conversation

❌ **Cannot see:**
- Other Admins
- Private messages from other chats (only selected)

**Chat Flow:**
```
Admin opens Chat → Sees all Farmers + Buyers → Selects one → View messages
```

### Farmer/Buyer Access

✅ **Can see:**
- Admin(s) in chat list
- Messages with Admin

❌ **Cannot see:**
- Other Farmers/Buyers
- Messages between other users
- Admin conversations with others (unless with them)

**Chat Flow:**
```
Farmer opens Chat → Sees only Admin → Auto-selects or clicks → View messages
```

### Example Scenarios

#### Scenario 1: Admin chatting with Farmer
```
Timeline:
1. Admin logs in → Sees all users (farmers + buyers)
2. Farmer logs in → Sees only admin
3. Both open each other's chat
4. Messages flow both ways in real-time
```

#### Scenario 2: Multiple Farmers
```
Timeline:
1. Farmer 1 logs in → Sees Admin
2. Farmer 2 logs in → Sees Admin
3. Both can chat with Admin simultaneously
4. Admin can switch between them
5. No cross-communication between farmers
```

---

## Usage Examples

### Example 1: Basic Chat Flow

```typescript
// User 1 (Farmer) - Frontend
import { initSocket, registerUserLogin, sendMessage } from '@/lib/socketService';

// Step 1: Initialize socket
await initSocket();

// Step 2: Register login
registerUserLogin({
  userId: 'farmer1',
  role: 'farmer',
  name: 'John Farmer',
  email: 'john@example.com',
});

// Step 3: Send message
sendMessage({
  senderUserId: 'farmer1',
  receiverUserId: 'admin1',
  message: 'Hi Admin, I have a question!',
  senderName: 'John Farmer',
  senderRole: 'farmer',
});

// Step 4: Listen for messages
onMessageReceive((message) => {
  console.log('Admin replied:', message.message);
});
```

### Example 2: Admin Multiple Chats

```typescript
// Admin - Frontend
const [selectedConversation, setSelectedConversation] = useState(null);

// Admin sees all users
const filteredUsers = allUsers.filter(
  u => u.role === 'farmer' || u.role === 'buyer'
);

// Can switch between conversations
const switchChat = (user) => {
  setSelectedConversation(user);
  requestChatHistory(adminId, user.id); // Load history
};

// Each conversation maintains separate message array
const sendToUser = (selectedUser, messageText) => {
  sendMessage({
    senderUserId: adminId,
    receiverUserId: selectedUser.id,
    message: messageText,
    senderName: 'Admin',
    senderRole: 'admin',
  });
};
```

### Example 3: Online Status

```typescript
// Listen for online users
onOnlineUsersUpdate((users) => {
  const isUserOnline = (userId) => 
    users.some(u => u.userId === userId);

  // Show green dot next to online users
  conversations.forEach(conv => {
    conv.online = isUserOnline(conv.userId);
  });
});
```

---

## Troubleshooting

### Issue 1: Socket Connection Fails

**Error:** `WebSocket connection failed`

**Solutions:**
1. Check backend is running: `http://localhost:5000`
2. Verify FRONTEND_URL in `.env`
3. Check CORS settings in server.js
4. Check browser console for errors

```javascript
// Verify connection
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});
```

### Issue 2: Messages Not Sending

**Error:** `Message sent but not received`

**Solutions:**
1. Check both users have `user:login` event emitted
2. Verify `onlineUsers` list includes recipient
3. Check message format matches schema
4. Look at server logs for errors

```typescript
// Debug: Check online users
console.log('Online users:', onlineUsers);
console.log('Recipient online?', 
  onlineUsers.some(u => u.userId === recipientId)
);
```

### Issue 3: Cannot See Users in Chat List

**Error:** `No conversations available`

**Possible Causes:**
1. User not logged in (role missing)
2. No admins online for farmer/buyer
3. Admin sees no farmers/buyers online

**Solutions:**
1. Verify `currentUser.role` is set correctly
2. Check firestore users collection
3. Ensure users are registered with `user:login`

```typescript
// Debug: Check current user
console.log('Current role:', currentUser.role);
console.log('Online users:', onlineUsers);
console.log('Filtered users:', 
  currentUser.role === 'admin' 
    ? onlineUsers.filter(u => u.role !== 'admin')
    : onlineUsers.filter(u => u.role === 'admin')
);
```

### Issue 4: Messages Lost on Disconnect

**Current Behavior:** Messages stored in memory (server)

**For Production:**
- Store messages in MongoDB
- Implement message persistence
- Add message recovery on reconnect

```javascript
// TODO: Production setup
// 1. Replace chatMessages Map with MongoDB
// 2. Save messages to DB on emit
// 3. Load from DB on chat:history
```

---

## Performance Considerations

### Scalability Tips

1. **Message Storage**: Currently in-memory (100 messages max per conversation)
   - Switch to MongoDB for production
   - Implement pagination for history

2. **Active Users**: Map-based storage
   - Suitable for small-medium deployments
   - Use Redis for large deployments

3. **Real-time Sync**: Socket.io with default transport
   - For 1000+ concurrent: Configure Redis adapter
   - Monitor socket pools

### Best Practices

1. **Cleanup**: Always unsubscribe from listeners
```typescript
useEffect(() => {
  const unsubscribe = onMessageReceive(handler);
  return () => unsubscribe?.();
}, []);
```

2. **Error Handling**: Always wrap socket operations
```typescript
try {
  await initSocket();
  registerUserLogin(userData);
} catch (error) {
  console.error('Chat initialization failed:', error);
  setError(true);
}
```

3. **Throttle Messages**: Implement rate limiting
```typescript
// Prevent spam
const [lastMessageTime, setLastMessageTime] = useState(0);
const handleSend = () => {
  if (Date.now() - lastMessageTime < 1000) return; // 1 second throttle
  sendMessage(...);
  setLastMessageTime(Date.now());
};
```

---

## Migration from Firestore to Socket.io

If you're migrating existing chat data:

### Step 1: Backup Firestore Data
```typescript
// Export conversations from Firestore
const conversations = await getDocs(
  query(collection(db, 'messages'), orderBy('created_at', 'desc'))
);
```

### Step 2: Migrate to Backend Storage
```javascript
// Import into server chatMessages Map
conversations.forEach(msg => {
  storeMessage(msg.sender_id, msg.receiver_id, msg);
});
```

### Step 3: Test
- Open chat page
- Verify all existing messages appear
- Send new message to confirm real-time works

---

## Next Steps / Enhancements

- [ ] MongoDB integration for persistence
- [ ] Message search functionality
- [ ] Group chats (multiple admins/users)
- [ ] File/media sharing
- [ ] Voice/video call integration
- [ ] Message reactions/emoji
- [ ] Typing indicators
- [ ] End-to-end encryption
- [ ] Message delivery receipts
- [ ] Admin broadcast messages

---

## Files Modified/Created

### Backend Modified
- ✏️ `server/server.js` - Added Socket.io setup + REST APIs
- ✏️ `server/package.json` - Added socket.io dependency

### Frontend Created
- ✨ `src/lib/socketService.ts` - Socket.io client wrapper
- ✨ `src/components/ChatSidebar.tsx` - User list component
- ✨ `src/components/ChatWindow.tsx` - Message display component

### Frontend Modified
- ✏️ `src/pages/Chat.tsx` - Refactored to use Socket.io
- ✏️ `package.json` - Added socket.io-client dependency

---

## Support & Questions

For issues or questions:
1. Check troubleshooting section
2. Review backend logs: `npm run dev`
3. Check browser console for client errors
4. Verify Socket.io events are firing: DevTools → Network → WS

---

**Last Updated:** April 11, 2026
**Version:** 1.0.0
