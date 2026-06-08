import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in server directory
const envPath = path.resolve(__dirname, '.env');
console.log('📁 Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Verify environment variables are loaded
console.log('🔍 Environment Variables Check:');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ Loaded' : '✗ Missing');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default (http://localhost:5173)');

// Validate mandatory Razorpay environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env file');
  console.error('   Please ensure your .env file contains:');
  console.error('   - RAZORPAY_KEY_ID=rzp_test_...');
  console.error('   - RAZORPAY_KEY_SECRET=...');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server with Socket.io
const httpServer = createServer(app);
const corsOptions = {
  origin: [
    'https://app-final-eta.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST'],
  credentials: true,
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Razorpay instance - NEVER expose these keys to frontend
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('✅ Razorpay instance initialized successfully');

// ========================= SOCKET.IO CHAT SETUP =========================
// Map to store active users and their socket connections
const activeUsers = new Map(); // userId -> { socketId, userId, role, name }
const userSockets = new Map(); // socketId -> userId

// Chat message storage (in production, use MongoDB)
const chatMessages = new Map(); // conversationId -> [messages]

/**
 * Socket.io connection and event handlers
 */
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  /**
   * User registers when they login
   * Tells server which user is connected via this socket
   */
  socket.on('user:login', (userData) => {
    const { userId, role, name, email } = userData;
    
    activeUsers.set(userId, {
      socketId: socket.id,
      userId,
      role,
      name,
      email,
    });
    userSockets.set(socket.id, userId);

    console.log(`✅ ${role.toUpperCase()} logged in:`, name, `(${userId})`);

    // Broadcast online users list to all connected users
    broadcastOnlineUsers();
  });

  /**
   * Send direct message between two users
   */
  socket.on('message:send', (messageData) => {
    const { senderUserId, receiverUserId, message, senderName, senderRole } = messageData;
    const timestamp = new Date().toISOString();

    // Create message object
    const msgObject = {
      id: `msg_${Date.now()}_${Math.random()}`,
      senderId: senderUserId,
      senderName,
      senderRole,
      receiverId: receiverUserId,
      message,
      timestamp,
      read: false,
    };

    // Store message (in production, save to MongoDB)
    storeMessage(senderUserId, receiverUserId, msgObject);

    // Get receiver's socket and send message
    const receiver = activeUsers.get(receiverUserId);
    if (receiver) {
      io.to(receiver.socketId).emit('message:receive', msgObject);
      console.log(`📨 Message sent from ${senderName} to ${receiver.name}`);
    } else {
      console.log(`⚠️ Receiver ${receiverUserId} not online, message stored`);
    }

    // Send confirmation to sender
    socket.emit('message:sent', {
      id: msgObject.id,
      timestamp,
      status: 'sent',
    });
  });

  /**
   * Request chat history between two users
   */
  socket.on('chat:history', (historyData) => {
    const { userId, otherUserId } = historyData;
    const conversationId = getConversationId(userId, otherUserId);
    const messages = chatMessages.get(conversationId) || [];

    socket.emit('chat:history:response', {
      messages,
      conversationId,
    });

    console.log(`📜 Chat history sent for ${conversationId}: ${messages.length} messages`);
  });

  /**
   * Mark messages as read
   */
  socket.on('message:read', (readData) => {
    const { senderUserId, receiverUserId } = readData;
    const conversationId = getConversationId(senderUserId, receiverUserId);
    const messages = chatMessages.get(conversationId) || [];

    // Mark messages from sender as read
    messages.forEach((msg) => {
      if (msg.senderId === senderUserId) {
        msg.read = true;
      }
    });

    // Notify sender about read status
    const sender = activeUsers.get(senderUserId);
    if (sender) {
      io.to(sender.socketId).emit('message:read:status', {
        conversationId,
      });
    }
  });

  /**
   * User disconnects
   */
  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      activeUsers.delete(userId);
      userSockets.delete(socket.id);
      console.log(`❌ User disconnected: ${userId}`);
      broadcastOnlineUsers();
    }
  });
});

// ========================= HELPER FUNCTIONS =========================

/**
 * Broadcast online users to all clients
 */
function broadcastOnlineUsers() {
  const usersArray = Array.from(activeUsers.values());
  io.emit('users:online', usersArray);
  console.log(`📊 Broadcasting ${usersArray.length} online users`);
}

/**
 * Generate consistent conversation ID from two user IDs
 */
function getConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

/**
 * Store message in memory (in production, use MongoDB)
 */
function storeMessage(senderUserId, receiverUserId, messageObj) {
  const conversationId = getConversationId(senderUserId, receiverUserId);
  
  if (!chatMessages.has(conversationId)) {
    chatMessages.set(conversationId, []);
  }
  
  const messages = chatMessages.get(conversationId);
  messages.push(messageObj);
  
  // Keep only last 100 messages per conversation (limit memory usage)
  if (messages.length > 100) {
    messages.shift();
  }
}

// ========================= REST API ENDPOINTS =========================
app.get('/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

/**
 * Create Razorpay Order - Called by frontend
 * Security: Key verification happens on backend, secret never exposed
 */
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    console.log('--- New Order Request ---');
    console.log('Request Body:', req.body);
    console.log('Razorpay Key ID used:', process.env.RAZORPAY_KEY_ID?.substring(0,12));
    
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    // Validate amount (in smallest unit - paise for INR)
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Create order with Razorpay
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        created_at: new Date().toISOString(),
      },
    };

    console.log('📦 Creating Razorpay order:', { amount: amount / 100, currency });

    const order = await razorpay.orders.create(orderOptions);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });

    console.log('✅ Order created:', order.id);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.error ? error.error.description : (error.message || 'Unknown error'),
      fullError: error
    });
  }
});

/**
 * Verify Payment Signature - Critical for security
 * This MUST be called from backend to verify payment authenticity
 * DO NOT verify signature on frontend - anyone can modify frontend code
 */
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment details',
      });
    }

    // Create signature hash using backend secret
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    // Compare signatures
    const isSignatureValid = generated_signature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn('⚠️ Signature mismatch:', {
        generated: generated_signature,
        received: razorpay_signature,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    console.log('✅ Payment signature verified:', razorpay_payment_id);

    // Fetch payment details from Razorpay for additional verification
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // Additional checks
    if (paymentDetails.status !== 'captured') {
      console.warn('⚠️ Payment not captured:', paymentDetails.status);
      return res.status(400).json({
        success: false,
        message: 'Payment not in captured state',
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: paymentDetails.status,
        timestamp: paymentDetails.created_at,
      },
    });

    console.log('💳 Payment successfully verified:', razorpay_payment_id);
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Optional: Fetch payment details (for receipts, etc.)
 */
app.get('/api/razorpay/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID required',
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Optional: Get order details
 */
app.get('/api/razorpay/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID required',
      });
    }

    const order = await razorpay.orders.fetch(orderId);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * API: Get users for chat based on current user's role
 * Admin sees all users (Farmers + Buyers)
 * Farmer/Buyer sees only Admins
 */
app.get('/api/chat/users', (req, res) => {
  try {
    const { userId, userRole } = req.query;

    if (!userId || !userRole) {
      return res.status(400).json({
        success: false,
        message: 'userId and userRole are required',
      });
    }

    const usersArray = Array.from(activeUsers.values());
    let filteredUsers = [];

    if (userRole === 'admin') {
      // Admin sees all users except other admins and themselves
      filteredUsers = usersArray.filter(
        (u) => u.userId !== userId && (u.role === 'farmer' || u.role === 'buyer')
      );
    } else {
      // Farmer/Buyer sees only admins
      filteredUsers = usersArray.filter(
        (u) => u.userId !== userId && u.role === 'admin'
      );
    }

    res.json({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    console.error('❌ Error fetching chat users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * API: Get chat messages between two users
 */
app.get('/api/chat/history/:userId/:otherUserId', (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (!userId || !otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'userId and otherUserId are required',
      });
    }

    const conversationId = getConversationId(userId, otherUserId);
    const messages = chatMessages.get(conversationId) || [];

    res.json({
      success: true,
      data: {
        conversationId,
        messages: messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * API: Get online users
 */
app.get('/api/chat/online-users', (req, res) => {
  try {
    const usersArray = Array.from(activeUsers.values());
    res.json({
      success: true,
      data: usersArray,
      count: usersArray.length,
    });
  } catch (error) {
    console.error('❌ Error fetching online users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server with port conflict prevention
const startServer = (port) => {
  httpServer.listen(port, () => {
    console.log('\n🚀 Server is running successfully!');
    console.log(`   URL: http://localhost:${port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   WebSocket: ws://localhost:${port}`);
    console.log('');
    console.log('✅ Configuration Verified:');
    console.log(`   ✓ RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID?.substring(0, 10) || 'Missing'}...`);
    console.log(`   ✓ RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET?.substring(0, 5) || 'Missing'}...`);
    console.log(`   ✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    console.log('');
    console.log('📚 API Endpoints:');
    console.log('   POST /api/razorpay/create-order');
    console.log('   POST /api/razorpay/verify-payment');
    console.log('   GET  /api/razorpay/payment/:paymentId');
    console.log('   GET  /api/razorpay/order/:orderId');
    console.log('   GET  /api/chat/users - Get chat users based on role');
    console.log('   GET  /api/chat/history/:userId/:otherUserId - Get chat history');
    console.log('   GET  /api/chat/online-users - Get all online users');
    console.log('   GET  /health');
    console.log('');
    console.log('🔌 Socket.io Events:');
    console.log('   user:login - Register user when logging in');
    console.log('   message:send - Send a message');
    console.log('   message:receive - Receive a message');
    console.log('   chat:history - Request chat history');
    console.log('   message:read - Mark messages as read');
    console.log('   users:online - Broadcast online users list');
    console.log('');
  });
};

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const currentPort = err.port || PORT;
    console.log(`⚠️ Port ${currentPort} is busy, automatically trying ${currentPort + 1}...`);
    startServer(currentPort + 1);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
