import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Timer, Eye, Pin, Edit, Trash2, Check, X, Volume2, VolumeX, Lock, Undo } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Message } from '~backend/chat/types';

interface MessageComponentProps {
  message: Message;
  isInvisibleMode: boolean;
  isOwnMessage: boolean;
  onMessageUpdate: () => void;
  currentUserNickname: string;
}

export default function MessageComponent({ message, isInvisibleMode, isOwnMessage, onMessageUpdate, currentUserNickname }: MessageComponentProps) {
  const [isRead, setIsRead] = useState(!!message.read_at);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isSoundMode, setIsSoundMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (message.read_at) {
      const readTime = new Date(message.read_at).getTime();
      const expiryTime = readTime + (10 * 60 * 1000); // 10 minutes after read
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, expiryTime - now);
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [message.read_at]);

  useEffect(() => {
    // Check if message can be edited (within 30 seconds) or deleted (within 3 seconds)
    if (isOwnMessage) {
      const messageTime = new Date(message.created_at).getTime();
      const now = Date.now();
      const timeDiff = (now - messageTime) / 1000; // in seconds
      
      setCanEdit(timeDiff <= 30);
      setCanDelete(timeDiff <= 3);

      if (timeDiff <= 30) {
        const editTimer = setTimeout(() => {
          setCanEdit(false);
        }, (30 - timeDiff) * 1000);
        
        const deleteTimer = setTimeout(() => {
          setCanDelete(false);
        }, (3 - timeDiff) * 1000);

        return () => {
          clearTimeout(editTimer);
          clearTimeout(deleteTimer);
        };
      }
    }
  }, [isOwnMessage, message.created_at]);

  const markAsRead = async () => {
    if (!isRead && !isMarkingRead) {
      setIsMarkingRead(true);
      try {
        await backend.chat.markMessageRead({ messageId: message.id });
        setIsRead(true);
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      } finally {
        setIsMarkingRead(false);
      }
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Message content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsEditingMessage(true);
    try {
      await backend.chat.editMessage({ 
        messageId: message.id, 
        newContent: editContent.trim(),
        isEncrypted: message.is_encrypted
      });
      setIsEditing(false);
      onMessageUpdate();
      toast({
        title: "Success",
        description: "Message edited successfully",
      });
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to edit message",
        variant: "destructive"
      });
    } finally {
      setIsEditingMessage(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await backend.chat.deleteMessage({ 
        messageId: message.id,
        senderNickname: currentUserNickname
      });
      onMessageUpdate();
      toast({
        title: "Message Deleted",
        description: "Message has been deleted for everyone",
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete message",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePin = async () => {
    setIsPinning(true);
    try {
      await backend.chat.pinMessage({ 
        messageId: message.id, 
        isPinned: !message.is_pinned 
      });
      onMessageUpdate();
      toast({
        title: "Success",
        description: message.is_pinned ? "Message unpinned" : "Message pinned",
      });
    } catch (error) {
      console.error('Failed to pin message:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive"
      });
    } finally {
      setIsPinning(false);
    }
  };

  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      if (isSoundMode) {
        window.speechSynthesis.cancel();
        setIsSoundMode(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.7;
        utterance.onstart = () => setIsSoundMode(true);
        utterance.onend = () => setIsSoundMode(false);
        utterance.onerror = () => setIsSoundMode(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser",
        variant: "destructive"
      });
    }
  };

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shouldShowMessage = !isInvisibleMode || isHovered;

  // Auto-mark own messages as read
  useEffect(() => {
    if (isOwnMessage && !isRead) {
      markAsRead();
    }
  }, [isOwnMessage, isRead]);

  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-1 sm:px-0 ${
        message.is_pinned ? 'bg-yellow-500/10 rounded-lg p-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      <div 
        className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
          isOwnMessage 
            ? 'bg-purple-600 text-white' 
            : 'bg-white/10 text-gray-100'
        } ${isInvisibleMode && !isHovered ? 'blur-sm' : ''} transition-all duration-200 ${
          !isOwnMessage && !isRead ? 'cursor-pointer hover:bg-white/20' : ''
        } relative group`}
        onClick={!isOwnMessage ? markAsRead : undefined}
      >
        {/* Pin indicator */}
        {message.is_pinned && (
          <div className="absolute -top-2 -right-2">
            <Pin className="h-3 w-3 text-yellow-400 fill-current" />
          </div>
        )}

        {/* Encryption indicator */}
        {message.is_encrypted && (
          <div className="absolute -top-2 -left-2">
            <Lock className="h-3 w-3 text-green-400" />
          </div>
        )}

        {/* Regret button (only for own messages within 3 seconds) */}
        {isOwnMessage && canDelete && !isEditing && (
          <div className="absolute -top-8 left-0">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700 animate-pulse"
              title="Regret - Delete message for everyone (3s limit)"
            >
              <Undo className="h-3 w-3 mr-1" />
              Regret
            </Button>
          </div>
        )}

        {!isOwnMessage && (
          <div className="flex items-center mb-1">
            <span className="text-base sm:text-lg mr-2 flex-shrink-0">{message.sender_avatar}</span>
            <span className="text-xs sm:text-sm font-medium truncate">{message.sender_nickname}</span>
            {message.is_encrypted && (
              <Lock className="h-2 w-2 ml-1 text-green-400" />
            )}
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-white/10 border-white/20 text-white text-sm"
              maxLength={1000}
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={isEditingMessage}
                className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="h-6 px-2 text-xs border-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className={`text-sm sm:text-base break-words ${shouldShowMessage ? '' : 'select-none'}`}>
            {shouldShowMessage ? message.content : '••••••••••••••••'}
            {message.is_edited && (
              <span className="text-xs opacity-70 ml-2">(edited)</span>
            )}
            {message.is_encrypted && isOwnMessage && (
              <Lock className="inline h-2 w-2 ml-1 text-green-400" />
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2 text-xs opacity-70 gap-2">
          <span className="flex-shrink-0 text-xs">
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {!isRead && !isOwnMessage && (
              <Badge variant="secondary" className="text-xs px-1 sm:px-2 py-0">
                <Eye className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden sm:inline">Click to read</span>
                <span className="sm:hidden">Read</span>
              </Badge>
            )}
            
            {isRead && timeLeft !== null && timeLeft > 0 && (
              <Badge variant="destructive" className="text-xs px-1 sm:px-2 py-0">
                <Timer className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                {formatTimeLeft(timeLeft)}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons on hover */}
        {isHovered && shouldShowMessage && !canDelete && (
          <div className="absolute -top-8 right-0 flex space-x-1 bg-slate-800 rounded px-2 py-1 shadow-lg">
            {/* Text-to-speech button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={speakMessage}
              className="h-6 w-6 p-0 text-gray-300 hover:text-white"
              title="Text to speech"
            >
              {isSoundMode ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>

            {/* Pin button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePin}
              disabled={isPinning}
              className="h-6 w-6 p-0 text-gray-300 hover:text-white"
              title={message.is_pinned ? "Unpin message" : "Pin message"}
            >
              <Pin className={`h-3 w-3 ${message.is_pinned ? 'fill-current text-yellow-400' : ''}`} />
            </Button>

            {/* Edit button (only for own messages within 30 seconds) */}
            {isOwnMessage && canEdit && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0 text-gray-300 hover:text-white"
                title="Edit message (30s limit)"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
