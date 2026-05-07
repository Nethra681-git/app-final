# WhatsApp-Like Chat System Implementation

## Overview
A complete real-time chat system with role-based access control, using Firebase Firestore for data persistence and real-time synchronization.

## Architecture

### Components

#### 1. **Chat.tsx** - Main Chat Component
- **Left Sidebar (Chat List)**
  - Shows all available conversations
  - Search functionality to filter conversations
  - Shows last message preview, sender name, and time
  - Unread message indicator
  - Auto-selects first conversation on load

- **Right Side (Chat Screen)**
  - Displays messages for selected conversation
  - Messages aligned right (current user) or left (other user)
  - Auto-scroll to latest messages
  - Message input with Send button
  - Enter key support for quick sending

- **Role-Based Filtering**
  - **Admin**: Sees all farmers and buyers
  - **Farmer/Buyer**: Only sees Admin in chat list

### Data Models

#### Message Collection Structure
```typescript
{
  sender_id: string;           // User sending the message
  sender_name: string;         // Sender's display name
  receiver_id: string;         // User receiving the message
  participants: string[];      // [sender_id, receiver_id] (sorted)
  message: string;             // Message content
  created_at: Timestamp;       // Message timestamp
  read: boolean;               // Read status flag
}
```

#### Conversation (In-Memory)
```typescript
{
  userId: string;              // The other user's ID
  userName: string;            // The other user's name
  userRole: string;            // The other user's role
  lastMessage: string;         // Preview of last message
  lastMessageTime: Timestamp;  // When last message was sent
  lastMessageSender: string;   // Who sent the last message
  participants: string[];      // Both user IDs
  unreadCount: number;         // Count of unread messages
}
```

## Key Features

### 1. Real-Time Synchronization
- Uses `onSnapshot()` for live message updates
- Automatic conversation list refresh
- No page refresh needed

### 2. Search Functionality
- Case-insensitive search by user name
- Instant filtering of conversations
- Search input in chat list header

### 3. Message Timestamps
- Full timestamp for each message (HH:MM)
- Relative time for last message (now, 5m, 2h, yesterday, etc.)

### 4. User Status Display
- Shows user role (admin, farmer, buyer) in chat header
- User avatar with first letter of name

### 5. Empty States
- "No conversations yet" when list is empty
- "No messages yet" when starting new chat
- "Select a conversation" when viewing empty chat area

## Services

### messageService.ts Functions

#### `sendMessage(senderId, senderName, receiverId, messageText)`
Saves message to Firestore with proper structure.

**Parameters:**
- `senderId`: Current user's ID
- `senderName`: Current user's name
- `receiverId`: Recipient's ID
- `messageText`: Message content

**Returns:** Document ID of saved message

---

#### `subscribeToMessages(userId, callback, otherUserId?)`
Real-time subscription to messages where user is a participant.

**Parameters:**
- `userId`: Current user's ID
- `callback`: Function called with updated message list
- `otherUserId`: Optional - filter by specific conversation

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = subscribeToMessages(
  currentUser.id,
  (messages) => setMessages(messages),
  selectedUser.id
);

// Cleanup
return () => unsubscribe();
```

---

#### `subscribeToConversations(userId, userRole, callback)`
Real-time subscription to all conversations for a user.

**Parameters:**
- `userId`: Current user's ID
- `userRole`: User's role (admin, farmer, buyer)
- `callback`: Function called with updated conversations

**Returns:** Unsubscribe function

**Features:**
- Automatically filters based on user role
- Groups messages by conversation partner
- Includes last message preview
- Sorts by most recent first

---

#### `getChatUsers(currentUserId, currentUserRole)`
Fetches all approved users available for chat.

**Parameters:**
- `currentUserId`: Current user's ID
- `currentUserRole`: User's role (admin, farmer, buyer)

**Returns:** Array of ChatUser objects

**Filtering Logic:**
- Admin: Gets all farmers + buyers
- Farmer/Buyer: Gets only Admin

## Firestore Rules (Recommended)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages - everyone can read/write their own
    match /messages/{document=**} {
      allow read: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid == request.resource.data.sender_id;
      allow update: if request.auth.uid in resource.data.participants;
    }
    
    // Users - everyone can read, admins update status
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Usage Example

### Basic Setup in Component
```typescript
import Chat from '@/pages/Chat';
import { useStore } from '@/lib/store';

function App() {
  const { currentUser } = useStore();
  
  if (!currentUser) {
    return <Login />;
  }
  
  return <Chat />;
}
```

### Sending Messages Manually
```typescript
import { sendMessage } from '@/lib/messageService';

await sendMessage(
  currentUser.id,
  currentUser.name,
  otherUser.id,
  'Hello there!'
);
```

### Listening to Conversations
```typescript
import { subscribeToConversations } from '@/lib/messageService';

useEffect(() => {
  const unsubscribe = subscribeToConversations(
    currentUser.id,
    currentUser.role,
    (conversations) => {
      setConversations(conversations);
    }
  );
  
  return unsubscribe;
}, []);
```

## UI/UX Flow

### Admin View
1. Opens Chat page
2. Sees list of all farmers and buyers on left sidebar
3. Can search for specific user
4. Clicks on user to open conversation
5. Sees all messages with that user
6. Can type and send new messages
7. Messages appear in real-time for both users

### Farmer/Buyer View
1. Opens Chat page
2. Sees only Admin in chat list
3. Clicks to open conversation with Admin
4. Can view message history
5. Can send messages to Admin
6. Messages appear in Admin's chat list

## Performance Optimizations

1. **Query Filtering**
   - Uses `participants` array for efficient Firestore queries
   - Indexed on `participants` and `created_at`

2. **Message Deduplication**
   - Uses Map to prevent duplicate message rendering
   - Checks message ID before adding to state

3. **Real-Time Subscriptions**
   - Properly unsubscribe in useEffect cleanup
   - Prevents memory leaks

4. **Search Optimization**
   - Client-side filtering (since list is usually small)
   - Case-insensitive partial matching

## Troubleshooting

### Messages Not Showing
1. Check Firestore collection structure matches expected format
2. Verify `participants` array is properly sorted
3. Check user IDs match between sender/receiver

### Chat List Empty
1. Verify user role is set correctly in Firestore
2. Check user status is "approved"
3. Ensure both users exist in Firestore

### Real-Time Updates Not Working
1. Check Firestore security rules allow read access
2. Verify network connection
3. Check browser console for errors

### Messages Not Sending
1. Verify `sender_id` and `receiver_id` are valid UIDs
2. Check Firestore write permissions
3. Ensure `message` text is not empty

## Future Enhancements

1. **Message Typing Indicator**
   - Show "typing..." status
   - Update real-time when user starts typing

2. **Message Read Receipts**
   - Mark messages as read
   - Show read status for sent messages

3. **File Attachments**
   - Upload images, documents
   - File preview in chat

4. **Notification Badges**
   - Show unread count on app icon
   - Unread messages indicator

5. **Emoji Support**
   - Add emoji picker
   - Support emoji reactions

6. **Message Search**
   - Full-text search in message history
   - Filter by date range

7. **User Blocking**
   - Block/unblock users
   - Filter blocked conversations

## Testing Checklist

- [ ] Admin can see all farmers and buyers
- [ ] Farmer/Buyer can only see Admin
- [ ] Messages send and receive in real-time
- [ ] Search filters correctly
- [ ] Last message preview shows correctly
- [ ] Timestamps display correctly
- [ ] Auto-scroll to latest message works
- [ ] Empty states display properly
- [ ] Mobile responsive layout works
- [ ] No duplicate messages appear

## Database Structure

Required Firestore Collections:

1. **messages**
   - Indexed on: `participants`, `created_at`
   - TTL: Never (keep forever)

2. **users**
   - Should exist (likely already created)
   - Has: id, name, email, role, status

## Integration Notes

- Uses existing Zustand store for user state
- Compatible with existing Firestore setup
- Uses Tailwind CSS for styling (matches project theme)
- Lucide React icons for UI elements
- No additional dependencies needed

---

## Code Quality

- ✅ No recursive rendering
- ✅ Proper cleanup of subscriptions
- ✅ Type-safe with TypeScript
- ✅ Handles loading/error states
- ✅ Responsive design
- ✅ Accessible UI components
- ✅ Performance optimized queries
