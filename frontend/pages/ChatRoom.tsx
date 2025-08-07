import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Shield, 
  Timer, 
  Eye, 
  EyeOff, 
  QrCode, 
  AlertTriangle,
  Copy,
  LogOut,
  MessageCircle,
  Menu,
  Pin,
  X,
  Users,
  Lock,
  LockOpen
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Message, TypingIndicator as TypingIndicatorType } from '~backend/chat/types';
import MessageComponent from '../components/MessageComponent';
import QRCodeModal from '../components/QRCodeModal';
import PanicButton from '../components/PanicButton';
import TypingIndicator from '../components/TypingIndicator';
import ThemeToggle from '../components/ThemeToggle';
import ScreenshotDetector from '../components/ScreenshotDetector';
import EmojiPicker from '../components/EmojiPicker';
import { useEncryption } from '../hooks/useEncryption';

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userNickname, setUserNickname] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInvisibleMode, setIsInvisibleMode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [screenshotDetectionEnabled, setScreenshotDetectionEnabled] = useState(true);
  const [currentParticipants, setCurrentParticipants] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<number, string>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const typingIntervalRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const activityIntervalRef = useRef<NodeJS.Timeout>();
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Initialize encryption
  const {
    isSupported: encryptionSupported,
    isKeyReady,
    error: encryptionError,
    encryptMessage,
    decryptMessage,
  } = useEncryption(roomId || '', password);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Cleanup on unmount or tab close
    const handleBeforeUnload = () => {
      if (userNickname) {
        // Send leave room request
        backend.chat.leaveRoom({ roomId: roomId!, userNickname }).catch(console.error);
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        if (activityIntervalRef.current) {
          clearInterval(activityIntervalRef.current);
        }
      } else if (isAuthenticated) {
        // Page is visible again, resume polling
        loadMessages();
        loadTypingIndicators();
        pollIntervalRef.current = setInterval(loadMessages, 3000);
        typingIntervalRef.current = setInterval(loadTypingIndicators, 2000);
        activityIntervalRef.current = setInterval(updateActivity, 30000); // Update activity every 30 seconds
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      handleBeforeUnload();
    };
  }, [roomId, navigate, isAuthenticated, userNickname]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages();
      loadTypingIndicators();
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(loadMessages, 3000);
      // Poll for typing indicators every 2 seconds
      typingIntervalRef.current = setInterval(loadTypingIndicators, 2000);
      // Update activity every 30 seconds
      activityIntervalRef.current = setInterval(updateActivity, 30000);
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Only scroll if new messages were added
    if (messages.length > lastMessageCount) {
      scrollToBottom();
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount]);

  useEffect(() => {
    // Update pinned messages when messages change
    setPinnedMessages(messages.filter(msg => msg.is_pinned));
  }, [messages]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Decrypt messages when encryption is ready
  useEffect(() => {
    if (!isKeyReady || !encryptionEnabled) return;

    const decryptAllMessages = async () => {
      const newDecryptedMessages = new Map<number, string>();
      
      for (const message of messages) {
        if (message.is_encrypted && !decryptedMessages.has(message.id)) {
          try {
            const decrypted = await decryptMessage(message.content);
            newDecryptedMessages.set(message.id, decrypted);
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            newDecryptedMessages.set(message.id, '[Decryption failed]');
          }
        }
      }

      if (newDecryptedMessages.size > 0) {
        setDecryptedMessages(prev => new Map([...prev, ...newDecryptedMessages]));
      }
    };

    decryptAllMessages();
  }, [messages, isKeyReady, encryptionEnabled, decryptMessage, decryptedMessages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const updateActivity = async () => {
    if (!roomId || !userNickname) return;
    
    try {
      await backend.chat.updateParticipantActivity({
        roomId: roomId,
        userNickname: userNickname
      });
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const joinRoom = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter the room password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await backend.chat.joinRoom({ 
        roomId: roomId!, 
        password: password.trim()
      });
      
      setIsAuthenticated(true);
      setUserNickname(response.nickname);
      setUserAvatar(response.avatar);
      setTheme(response.theme_mode || 'dark');
      setCurrentParticipants(response.current_participants);
      setMaxParticipants(response.max_participants);
      setEncryptionEnabled(response.encryption_enabled);
      
      toast({
        title: "Welcome!",
        description: `You've joined as ${response.nickname} ${response.avatar}${response.encryption_enabled ? ' • E2E Encryption Active' : ''}`,
      });

      // Focus on message input after joining
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 500);
    } catch (error) {
      console.error('Failed to join room:', error);
      let errorMessage = "Invalid password or room not found";
      
      if (error instanceof Error) {
        if (error.message.includes('maximum participant limit')) {
          errorMessage = "Room has reached maximum participant limit";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: "Access Denied",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!roomId) return;
    
    try {
      const response = await backend.chat.getMessages({ roomId: roomId });
      setMessages(response.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // If room is not found, redirect to home
      if (error instanceof Error && error.message.includes('not found')) {
        toast({
          title: "Room Expired",
          description: "This chat room has expired or been deleted",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  };

  const loadTypingIndicators = async () => {
    if (!roomId) return;
    
    try {
      const response = await backend.chat.getTyping({ roomId: roomId });
      setTypingUsers(response.typingUsers);
    } catch (error) {
      console.error('Failed to load typing indicators:', error);
    }
  };

  const updateTypingIndicator = async () => {
    if (!roomId || !userNickname || !userAvatar) return;
    
    try {
      await backend.chat.updateTyping({
        roomId: roomId,
        userNickname: userNickname,
        userAvatar: userAvatar
      });
    } catch (error) {
      console.error('Failed to update typing indicator:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Update typing indicator
    updateTypingIndicator();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      // Typing indicator will automatically expire on server side
    }, 3000);
  };

  const handleEmojiSelect = (emoji: string) => {
    const input = messageInputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = newMessage.slice(0, start) + emoji + newMessage.slice(end);
      setNewMessage(newValue);
      
      // Set cursor position after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setNewMessage(prev => prev + emoji);
    }
  };

  const sendMessage = async () => {
    const messageContent = newMessage.trim();
    if (!messageContent) return;

    if (messageContent.length > 1000) {
      toast({
        title: "Error",
        description: "Message too long (max 1000 characters)",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    const tempMessage = messageContent;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      let contentToSend = tempMessage;
      let isEncrypted = false;

      // Encrypt message if encryption is enabled and ready
      if (encryptionEnabled && isKeyReady) {
        try {
          contentToSend = await encryptMessage(tempMessage);
          isEncrypted = true;
        } catch (error) {
          console.error('Failed to encrypt message:', error);
          toast({
            title: "Encryption Error",
            description: "Failed to encrypt message. Sending unencrypted.",
            variant: "destructive"
          });
        }
      }

      await backend.chat.sendMessage({
        roomId: roomId!,
        content: contentToSend,
        senderNickname: userNickname,
        senderAvatar: userAvatar,
        isEncrypted: isEncrypted
      });
      
      // Store decrypted version for own message if encrypted
      if (isEncrypted) {
        // We'll get the message ID from the next poll, for now just refresh
        setTimeout(() => loadMessages(), 100);
      } else {
        // Immediately load messages to show the new message
        await loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message content if sending failed
      setNewMessage(tempMessage);
      
      let errorMessage = "Failed to send message";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyRoomLink = async () => {
    const roomUrl = `${window.location.origin}/chat/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      toast({
        title: "Copied!",
        description: "Room link copied to clipboard",
      });
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      toast({
        title: "Room Link",
        description: roomUrl,
      });
    }
    setShowMobileMenu(false);
  };

  const handleThemeChange = async (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    
    try {
      await backend.chat.updateTheme({
        roomId: roomId!,
        themeMode: newTheme
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const leaveRoom = async () => {
    if (userNickname) {
      try {
        await backend.chat.leaveRoom({ roomId: roomId!, userNickname });
      } catch (error) {
        console.error('Failed to leave room:', error);
      }
    }
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
    }
    navigate('/');
  };

  const getMessageContent = (message: Message): string => {
    if (message.is_encrypted && encryptionEnabled) {
      return decryptedMessages.get(message.id) || '[Decrypting...]';
    }
    return message.content;
  };

  const themeClasses = theme === 'light' 
    ? 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 text-gray-900'
    : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white';

  const cardClasses = theme === 'light'
    ? 'bg-white/80 backdrop-blur-md border-gray-200 text-gray-900'
    : 'bg-white/10 backdrop-blur-md border-white/20 text-white';

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-3 sm:p-4 ${themeClasses}`}>
        <Card className={`w-full max-w-sm sm:max-w-md ${cardClasses}`}>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className={`flex items-center text-lg sm:text-xl ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-400" />
              Enter Chat Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <p className={`mb-3 sm:mb-4 text-sm sm:text-base break-all ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Room ID: {roomId}
              </p>
            </div>
            <Input
              type="password"
              placeholder="Enter room password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-10 sm:h-11 ${
                theme === 'light' 
                  ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
                  : 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              autoFocus
            />
            <Button 
              onClick={joinRoom}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10 sm:h-11"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className={`w-full h-10 sm:h-11 ${
                theme === 'light'
                  ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  : 'border-white/20 text-gray-300 hover:bg-white/10'
              }`}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses}`}>
      {/* Screenshot Detection */}
      <ScreenshotDetector isActive={screenshotDetectionEnabled && isAuthenticated} />

      {/* Header */}
      <div className={`backdrop-blur-md border-b p-3 sm:p-4 ${
        theme === 'light' 
          ? 'bg-white/80 border-gray-200' 
          : 'bg-white/10 border-white/20'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className={`font-semibold text-sm sm:text-base lg:text-lg truncate ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Secure Chat
              </h1>
              <div className="flex items-center space-x-2">
                <p className={`text-xs sm:text-sm truncate ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {userAvatar} {userNickname}
                </p>
                {maxParticipants && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 flex items-center">
                    <Users className="h-2 w-2 mr-1" />
                    {currentParticipants}/{maxParticipants}
                  </Badge>
                )}
                {encryptionEnabled && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 flex items-center bg-green-500/20 text-green-400">
                    <Lock className="h-2 w-2 mr-1" />
                    E2E
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center space-x-1 lg:space-x-2">
            <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScreenshotDetectionEnabled(!screenshotDetectionEnabled)}
              className={`h-8 w-8 lg:h-9 lg:w-9 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:bg-white/10'
              } ${screenshotDetectionEnabled ? 'text-green-400' : 'text-red-400'}`}
              title={screenshotDetectionEnabled ? "Disable screenshot detection" : "Enable screenshot detection"}
            >
              <Shield className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsInvisibleMode(!isInvisibleMode)}
              className={`h-8 w-8 lg:h-9 lg:w-9 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              title={isInvisibleMode ? "Show messages" : "Hide messages"}
            >
              {isInvisibleMode ? <EyeOff className="h-3 w-3 lg:h-4 lg:w-4" /> : <Eye className="h-3 w-3 lg:h-4 lg:w-4" />}
            </Button>

            {pinnedMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                className={`h-8 w-8 lg:h-9 lg:w-9 relative ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
                title="Show pinned messages"
              >
                <Pin className="h-3 w-3 lg:h-4 lg:w-4" />
                <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {pinnedMessages.length}
                </Badge>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQRCode(true)}
              className={`h-8 w-8 lg:h-9 lg:w-9 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              title="Share QR code"
            >
              <QrCode className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomLink}
              className={`h-8 w-8 lg:h-9 lg:w-9 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              title="Copy room link"
            >
              <Copy className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
            
            <PanicButton />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={leaveRoom}
              className={`h-8 w-8 lg:h-9 lg:w-9 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              title="Leave room"
            >
              <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`h-8 w-8 ${
                theme === 'light' 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`sm:hidden mt-3 pt-3 border-t ${
            theme === 'light' ? 'border-gray-200' : 'border-white/20'
          }`}>
            <div className="grid grid-cols-3 gap-2">
              <ThemeToggle 
                theme={theme} 
                onThemeChange={handleThemeChange}
                className={`flex flex-col items-center p-2 h-auto ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setScreenshotDetectionEnabled(!screenshotDetectionEnabled);
                  setShowMobileMenu(false);
                }}
                className={`flex flex-col items-center p-2 h-auto ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                } ${screenshotDetectionEnabled ? 'text-green-400' : 'text-red-400'}`}
              >
                <Shield className="h-4 w-4 mb-1" />
                <span className="text-xs">
                  {screenshotDetectionEnabled ? 'Shield On' : 'Shield Off'}
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsInvisibleMode(!isInvisibleMode);
                  setShowMobileMenu(false);
                }}
                className={`flex flex-col items-center p-2 h-auto ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {isInvisibleMode ? <EyeOff className="h-4 w-4 mb-1" /> : <Eye className="h-4 w-4 mb-1" />}
                <span className="text-xs">
                  {isInvisibleMode ? 'Show' : 'Hide'}
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowQRCode(true);
                  setShowMobileMenu(false);
                }}
                className={`flex flex-col items-center p-2 h-auto ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <QrCode className="h-4 w-4 mb-1" />
                <span className="text-xs">QR Code</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomLink}
                className={`flex flex-col items-center p-2 h-auto ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Copy className="h-4 w-4 mb-1" />
                <span className="text-xs">Copy Link</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={leaveRoom}
                className={`flex flex-col items-center p-2 h-auto ${
                  theme === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <LogOut className="h-4 w-4 mb-1" />
                <span className="text-xs">Leave</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className={`border-b p-2 ${
        theme === 'light' 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-yellow-500/10 border-yellow-500/20'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-center px-2">
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1 sm:mr-2 flex-shrink-0" />
          <p className={`text-xs sm:text-sm text-center ${
            theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'
          }`}>
            Messages self-destruct 10 minutes after being read • Room expires in 24 hours
            {screenshotDetectionEnabled && ' • Screenshot detection active'}
            {encryptionEnabled && ' • End-to-end encrypted'}
            {maxParticipants && ` • Max ${maxParticipants} participants`}
            • Regret button available for 3 seconds
          </p>
        </div>
      </div>

      {/* Encryption Error Notice */}
      {encryptionError && (
        <div className={`border-b p-2 ${
          theme === 'light' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="max-w-6xl mx-auto flex items-center justify-center px-2">
            <LockOpen className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mr-1 sm:mr-2 flex-shrink-0" />
            <p className={`text-xs sm:text-sm text-center ${
              theme === 'light' ? 'text-red-800' : 'text-red-200'
            }`}>
              Encryption Error: {encryptionError}
            </p>
          </div>
        </div>
      )}

      {/* Pinned Messages */}
      {showPinnedMessages && pinnedMessages.length > 0 && (
        <div className={`border-b p-2 sm:p-4 ${
          theme === 'light' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${
                theme === 'light' ? 'text-blue-800' : 'text-blue-200'
              }`}>
                Pinned Messages ({pinnedMessages.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPinnedMessages(false)}
                className={`h-6 w-6 p-0 ${
                  theme === 'light' 
                    ? 'text-blue-600 hover:bg-blue-100' 
                    : 'text-blue-300 hover:bg-blue-500/20'
                }`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {pinnedMessages.slice(0, 3).map((message) => (
                <div key={message.id} className={`text-xs p-2 rounded ${
                  theme === 'light' ? 'bg-white/80' : 'bg-white/10'
                }`}>
                  <span className="font-medium">{message.sender_avatar} {message.sender_nickname}:</span>
                  <span className="ml-2">{getMessageContent(message)}</span>
                  {message.is_encrypted && (
                    <Lock className="inline h-2 w-2 ml-1 text-green-400" />
                  )}
                </div>
              ))}
              {pinnedMessages.length > 3 && (
                <p className={`text-xs ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-300'
                }`}>
                  +{pinnedMessages.length - 3} more pinned messages
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
            {messages.length === 0 ? (
              <div className={`text-center mt-4 sm:mt-8 px-4 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                {encryptionEnabled && (
                  <p className="text-xs mt-2 text-green-400">
                    <Lock className="inline h-3 w-3 mr-1" />
                    End-to-end encryption is active
                  </p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <MessageComponent
                  key={message.id}
                  message={{
                    ...message,
                    content: getMessageContent(message)
                  }}
                  isInvisibleMode={isInvisibleMode}
                  isOwnMessage={message.sender_nickname === userNickname}
                  onMessageUpdate={loadMessages}
                  currentUserNickname={userNickname}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          <TypingIndicator typingUsers={typingUsers} currentUserNickname={userNickname} />

          {/* Message Input */}
          <div className={`p-2 sm:p-4 backdrop-blur-sm border-t ${
            theme === 'light' 
              ? 'bg-white/80 border-gray-200' 
              : 'bg-white/5 border-white/20'
          }`}>
            <div className="flex space-x-2">
              <Input
                ref={messageInputRef}
                placeholder={`Type your message...${encryptionEnabled ? ' (encrypted)' : ''}`}
                value={newMessage}
                onChange={handleInputChange}
                className={`flex-1 h-10 sm:h-11 text-sm sm:text-base ${
                  theme === 'light' 
                    ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
                    : 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                }`}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                maxLength={1000}
              />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending || (encryptionEnabled && !isKeyReady)}
                className="bg-purple-600 hover:bg-purple-700 text-white h-10 sm:h-11 w-10 sm:w-11 p-0 relative"
              >
                <Send className="h-4 w-4" />
                {encryptionEnabled && (
                  <Lock className="absolute -top-1 -right-1 h-2 w-2 text-green-400" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1">
              {newMessage.length > 900 && (
                <p className={`text-xs ${
                  theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                }`}>
                  {1000 - newMessage.length} characters remaining
                </p>
              )}
              {encryptionEnabled && !isKeyReady && (
                <p className="text-xs text-yellow-400">
                  <Lock className="inline h-3 w-3 mr-1" />
                  Initializing encryption...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        roomId={roomId!}
        password={password}
      />
    </div>
  );
}
