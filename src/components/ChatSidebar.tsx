import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import { Conversation, ChatUser } from '@/lib/socketService';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  conversations: Conversation[];
  onlineUsers: ChatUser[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export const ChatSidebar = ({
  conversations,
  onlineUsers,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  loading = false,
}: ChatSidebarProps) => {
  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userRole.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Check if a user is online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 bg-background">
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6 opacity-50" />
                <span className="text-sm">Loading conversations...</span>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6 opacity-50" />
                <span className="text-sm">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredConversations.map((conversation) => {
                const online = isUserOnline(conversation.userId);
                const isSelected =
                  selectedConversation?.userId === conversation.userId;

                return (
                  <button
                    key={conversation.userId}
                    onClick={() => onSelectConversation(conversation)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0',
                      isSelected && 'bg-accent'
                    )}
                  >
                    {/* Conversation Item */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative mt-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online Badge */}
                        {online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Role */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {conversation.userName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {conversation.userRole}
                          </Badge>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto bg-blue-500">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>

                        {/* Last Message */}
                        <div className="flex items-center gap-2">
                          {conversation.lastMessageSender === conversation.userName ? (
                            <span className="text-xs text-muted-foreground">You:</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {conversation.lastMessageSender}:
                            </span>
                          )}
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>

                        {/* Timestamp */}
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * Format timestamp for display
 */
function formatTime(
  timestamp: any
): string {
  if (!timestamp) return '';

  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    timestamp = timestamp.toDate();
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
