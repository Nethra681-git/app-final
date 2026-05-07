import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';
import { ChatMessage, Conversation, ChatUser } from '@/lib/socketService';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  currentUserId: string;
  currentUserName: string;
  messageInput: string;
  onMessageInputChange: (message: string) => void;
  onSendMessage: () => void;
  sending?: boolean;
  loading?: boolean;
}

export const ChatWindow = ({
  conversation,
  messages,
  onlineUsers,
  currentUserId,
  currentUserName,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  sending = false,
  loading = false,
}: ChatWindowProps) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  // Handle scroll manually to detect if user scrolled up
  const handleScroll = (event: any) => {
    const element = event.target;
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  // Handle send message on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim() && !sending) {
        onSendMessage();
      }
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">{t('chat_select_conversation_placeholder')}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a user from the sidebar to begin
          </p>
        </div>
      </div>
    );
  }

  const online = isUserOnline(conversation.userId);

  return (
    <div className="flex flex-col h-full bg-accent">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {conversation.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{conversation.userName}</h2>
              <Badge variant="outline" className="text-xs">
                {conversation.userRole}
              </Badge>
            </div>
            <div className="text-xs">
              {online ? (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-600 rounded-full" />
                  Active now
                </span>
              ) : (
                <span className="text-muted-foreground">Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea
        className="flex-1 bg-accent"
        ref={messagesContainerRef as any}
        onScroll={handleScroll}
      >
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <span className="text-sm text-muted-foreground">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUserMessage = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 items-end mb-2',
                    isCurrentUserMessage && 'flex-row-reverse gap-3'
                  )}
                >
                  {/* Avatar - show only for first message from sender */}
                  {showAvatar ? (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {message.senderName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 flex-shrink-0" />
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words',
                      isCurrentUserMessage
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    )}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={cn(
                        'text-xs mt-1 opacity-70',
                        isCurrentUserMessage && 'text-blue-100'
                      )}
                    >
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>

                  {/* Read Status */}
                  {isCurrentUserMessage && message.read && (
                    <span className="text-xs text-muted-foreground">✓✓</span>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim() || sending}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Format message timestamp for display
 */
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  // Same day - show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Different day - show date and time
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
