import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, MessageCircle, Timer, Eye, QrCode, Copy, ExternalLink, Sun, Moon, Users, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import QRCodeModal from '../components/QRCodeModal';
import { E2EEncryption } from '../utils/encryption';

export default function HomePage() {
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{ roomId: string; password: string; themeMode: 'dark' | 'light'; maxParticipants?: number; encryptionEnabled: boolean } | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [maxParticipants, setMaxParticipants] = useState<string>('');
  const [enableEncryption, setEnableEncryption] = useState(true);
  const [encryptionSupported, setEncryptionSupported] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check encryption support on mount
  useEffect(() => {
    setEncryptionSupported(E2EEncryption.isSupported());
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    document.documentElement.classList.toggle('light', themeMode === 'light');
  }, [themeMode]);

  const createRoom = async () => {
    const trimmedPassword = password.trim();
    
    if (!trimmedPassword) {
      toast({
        title: "Error",
        description: "Please enter a password for your chat room",
        variant: "destructive"
      });
      return;
    }

    if (trimmedPassword.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters long",
        variant: "destructive"
      });
      return;
    }

    if (trimmedPassword.length > 100) {
      toast({
        title: "Error",
        description: "Password too long (max 100 characters)",
        variant: "destructive"
      });
      return;
    }

    // Validate max participants
    let maxParticipantsNum: number | undefined;
    if (maxParticipants.trim()) {
      maxParticipantsNum = parseInt(maxParticipants.trim());
      if (isNaN(maxParticipantsNum) || maxParticipantsNum < 2) {
        toast({
          title: "Error",
          description: "Maximum participants must be at least 2",
          variant: "destructive"
        });
        return;
      }
      if (maxParticipantsNum > 50) {
        toast({
          title: "Error",
          description: "Maximum participants cannot exceed 50",
          variant: "destructive"
        });
        return;
      }
    }

    setIsCreating(true);
    try {
      const response = await backend.chat.createRoom({ 
        password: trimmedPassword,
        theme_mode: themeMode,
        max_participants: maxParticipantsNum,
        enable_encryption: enableEncryption && encryptionSupported
      });
      const roomUrl = `${window.location.origin}/chat/${response.roomId}`;
      
      // Store created room details for sharing
      setCreatedRoom({ 
        roomId: response.roomId, 
        password: trimmedPassword, 
        themeMode,
        maxParticipants: maxParticipantsNum,
        encryptionEnabled: response.encryptionEnabled
      });
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(roomUrl);
        toast({
          title: "Chat Room Created!",
          description: `Room URL copied to clipboard. ${response.encryptionEnabled ? 'End-to-end encryption enabled.' : 'Encryption disabled.'}`,
        });
      } catch (clipboardError) {
        console.warn('Failed to copy to clipboard:', clipboardError);
        toast({
          title: "Chat Room Created!",
          description: `Room ID: ${response.roomId}`,
        });
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      let errorMessage = "Failed to create chat room. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    const trimmedRoomId = roomId.trim();
    const trimmedPassword = joinPassword.trim();
    
    if (!trimmedRoomId || !trimmedPassword) {
      toast({
        title: "Error",
        description: "Please enter both room ID and password",
        variant: "destructive"
      });
      return;
    }

    // Validate room ID format (should be 32 hex characters)
    if (!/^[a-f0-9]{32}$/i.test(trimmedRoomId)) {
      toast({
        title: "Error",
        description: "Invalid room ID format",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    try {
      await backend.chat.joinRoom({ 
        roomId: trimmedRoomId, 
        password: trimmedPassword 
      });
      navigate(`/chat/${trimmedRoomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      let errorMessage = "Invalid room ID or password";
      
      if (error instanceof Error) {
        if (error.message.includes('maximum participant limit')) {
          errorMessage = "Room has reached maximum participant limit";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createRoom();
    }
  };

  const handleJoinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  const copyRoomDetails = async () => {
    if (!createdRoom) return;
    
    const roomUrl = `${window.location.origin}/chat/${createdRoom.roomId}`;
    const details = `Room: ${roomUrl}\nPassword: ${createdRoom.password}${createdRoom.maxParticipants ? `\nMax Participants: ${createdRoom.maxParticipants}` : ''}${createdRoom.encryptionEnabled ? '\nEnd-to-End Encryption: Enabled' : '\nEnd-to-End Encryption: Disabled'}`;
    
    try {
      await navigator.clipboard.writeText(details);
      toast({
        title: "Copied!",
        description: "Room details copied to clipboard",
      });
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      toast({
        title: "Room Details",
        description: details,
      });
    }
  };

  const joinCreatedRoom = () => {
    if (createdRoom) {
      navigate(`/chat/${createdRoom.roomId}`);
    }
  };

  const createNewRoom = () => {
    setCreatedRoom(null);
    setPassword('');
    setMaxParticipants('');
  };

  const themeClasses = themeMode === 'light' 
    ? 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 text-gray-900'
    : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white';

  const cardClasses = themeMode === 'light'
    ? 'bg-white/80 backdrop-blur-md border-gray-200 text-gray-900'
    : 'bg-white/10 backdrop-blur-md border-white/20 text-white';

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 ${themeClasses}`}>
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1"></div>
            <div className="flex items-center">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-400 mr-2 sm:mr-3" />
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeMode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                SecureChat
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                className={`h-8 w-8 lg:h-9 lg:w-9 ${
                  themeMode === 'light' 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
                title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
              >
                {themeMode === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className={`text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 px-4 ${
            themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Ultra-secure, self-destructing chat rooms with end-to-end encryption
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 px-2">
            <div className={`flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm ${
              themeMode === 'light' ? 'bg-gray-100/50' : 'bg-white/5'
            }`}>
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-400 mb-1 sm:mb-2" />
              <span className={`text-xs sm:text-sm text-center ${
                themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>Real-time Chat</span>
            </div>
            <div className={`flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm ${
              themeMode === 'light' ? 'bg-gray-100/50' : 'bg-white/5'
            }`}>
              <Timer className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-400 mb-1 sm:mb-2" />
              <span className={`text-xs sm:text-sm text-center ${
                themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>Self-Destructing</span>
            </div>
            <div className={`flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm ${
              themeMode === 'light' ? 'bg-gray-100/50' : 'bg-white/5'
            }`}>
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-400 mb-1 sm:mb-2" />
              <span className={`text-xs sm:text-sm text-center ${
                themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>End-to-End Encrypted</span>
            </div>
            <div className={`flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-lg backdrop-blur-sm ${
              themeMode === 'light' ? 'bg-gray-100/50' : 'bg-white/5'
            }`}>
              <QrCode className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-400 mb-1 sm:mb-2" />
              <span className={`text-xs sm:text-sm text-center ${
                themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>QR Sharing</span>
            </div>
          </div>
        </div>

        {/* Room Created Success Card */}
        {createdRoom && (
          <div className="mb-6 sm:mb-8 px-2 sm:px-0">
            <Card className={`${
              themeMode === 'light' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-green-500/10 border-green-500/20'
            } backdrop-blur-md`}>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className={`flex items-center text-lg sm:text-xl ${
                  themeMode === 'light' ? 'text-green-700' : 'text-green-400'
                }`}>
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Room Created Successfully!
                </CardTitle>
                <CardDescription className={`text-sm sm:text-base ${
                  themeMode === 'light' ? 'text-green-600' : 'text-green-200'
                }`}>
                  Your secure chat room is ready. Share the details below with your contact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className={`p-3 sm:p-4 rounded-lg ${
                  themeMode === 'light' ? 'bg-white/50' : 'bg-white/5'
                }`}>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-xs sm:text-sm ${
                        themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>Room ID:</span>
                      <div className={`p-2 rounded font-mono text-xs break-all ${
                        themeMode === 'light' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-white/10 text-white'
                      }`}>
                        {createdRoom.roomId}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm ${
                        themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>Password:</span>
                      <div className={`p-2 rounded font-mono text-xs ${
                        themeMode === 'light' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-white/10 text-white'
                      }`}>
                        {createdRoom.password}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm ${
                        themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>Encryption:</span>
                      <div className={`p-2 rounded text-xs flex items-center ${
                        themeMode === 'light' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-white/10 text-white'
                      }`}>
                        <Lock className="h-3 w-3 mr-1" />
                        {createdRoom.encryptionEnabled ? 'End-to-End Encryption Enabled' : 'Encryption Disabled'}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm ${
                        themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>Theme:</span>
                      <div className={`p-2 rounded text-xs flex items-center ${
                        themeMode === 'light' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-white/10 text-white'
                      }`}>
                        {createdRoom.themeMode === 'dark' ? (
                          <>
                            <Moon className="h-3 w-3 mr-1" />
                            Dark Mode
                          </>
                        ) : (
                          <>
                            <Sun className="h-3 w-3 mr-1" />
                            Light Mode
                          </>
                        )}
                      </div>
                    </div>
                    {createdRoom.maxParticipants && (
                      <div>
                        <span className={`text-xs sm:text-sm ${
                          themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>Max Participants:</span>
                        <div className={`p-2 rounded text-xs flex items-center ${
                          themeMode === 'light' 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'bg-white/10 text-white'
                        }`}>
                          <Users className="h-3 w-3 mr-1" />
                          {createdRoom.maxParticipants} people
                        </div>
                      </div>
                    )}
                    <div>
                      <span className={`text-xs sm:text-sm ${
                        themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>Expires:</span>
                      <div className={`p-2 rounded text-xs ${
                        themeMode === 'light' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-white/10 text-white'
                      }`}>
                        24 hours from creation
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <Button
                    onClick={() => setShowQRCode(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Share QR Code
                  </Button>
                  
                  <Button
                    onClick={copyRoomDetails}
                    variant="outline"
                    className={`h-10 sm:h-11 text-sm sm:text-base ${
                      themeMode === 'light'
                        ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                  
                  <Button
                    onClick={joinCreatedRoom}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Room
                  </Button>
                </div>
                
                <Button
                  onClick={createNewRoom}
                  variant="ghost"
                  className={`w-full h-8 text-sm ${
                    themeMode === 'light' 
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Create Another Room
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Cards - Only show if no room created */}
        {!createdRoom && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {/* Create Room */}
            <Card className={cardClasses}>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className={`flex items-center text-lg sm:text-xl ${
                  themeMode === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-400" />
                  Create Secure Room
                </CardTitle>
                <CardDescription className={`text-sm sm:text-base ${
                  themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Start a new encrypted chat session with advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="password" className={`text-sm sm:text-base ${
                    themeMode === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    Room Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password (4-100 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-1 sm:mt-2 h-10 sm:h-11 ${
                      themeMode === 'light' 
                        ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
                        : 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                    }`}
                    onKeyPress={handlePasswordKeyPress}
                    maxLength={100}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <Label htmlFor="theme" className={`text-sm sm:text-base ${
                    themeMode === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    Theme Mode
                  </Label>
                  <Select value={themeMode} onValueChange={(value: 'dark' | 'light') => setThemeMode(value)}>
                    <SelectTrigger className={`mt-1 sm:mt-2 h-10 sm:h-11 ${
                      themeMode === 'light' 
                        ? 'bg-gray-100 border-gray-300 text-gray-900'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${
                      themeMode === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-white/20'
                    }`}>
                      <SelectItem value="dark" className={`${
                        themeMode === 'light' ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                      }`}>
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="light" className={`${
                        themeMode === 'light' ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                      }`}>
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Light Mode
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxParticipants" className={`text-sm sm:text-base ${
                    themeMode === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    Max Participants (Optional)
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="Leave empty for unlimited (2-50)"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className={`mt-1 sm:mt-2 h-10 sm:h-11 ${
                      themeMode === 'light' 
                        ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
                        : 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                    }`}
                    min="2"
                    max="50"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="encryption"
                    checked={enableEncryption && encryptionSupported}
                    onCheckedChange={(checked) => setEnableEncryption(!!checked)}
                    disabled={!encryptionSupported}
                    className={`${
                      themeMode === 'light' 
                        ? 'border-gray-300 data-[state=checked]:bg-purple-600' 
                        : 'border-white/20 data-[state=checked]:bg-purple-600'
                    }`}
                  />
                  <Label htmlFor="encryption" className={`text-sm sm:text-base flex items-center ${
                    themeMode === 'light' ? 'text-gray-700' : 'text-gray-200'
                  } ${!encryptionSupported ? 'opacity-50' : ''}`}>
                    <Lock className="h-4 w-4 mr-1" />
                    Enable End-to-End Encryption
                    {!encryptionSupported && (
                      <span className="ml-2 text-xs text-red-400">(Not supported in this browser)</span>
                    )}
                  </Label>
                </div>
                <Button 
                  onClick={createRoom}
                  disabled={isCreating || !password.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10 sm:h-11 text-sm sm:text-base disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </Button>
                <div className={`text-xs space-y-1 ${
                  themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <p>✨ Security Features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>End-to-end encryption (AES-256-GCM)</li>
                    <li>Participant limits</li>
                    <li>Typing indicators</li>
                    <li>Message editing (30s window)</li>
                    <li>Pin important messages</li>
                    <li>Screenshot detection</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className={cardClasses}>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className={`flex items-center text-lg sm:text-xl ${
                  themeMode === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
                  Join Existing Room
                </CardTitle>
                <CardDescription className={`text-sm sm:text-base ${
                  themeMode === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Enter room details to join a chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="roomId" className={`text-sm sm:text-base ${
                    themeMode === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    Room ID
                  </Label>
                  <Input
                    id="roomId"
                    placeholder="Enter room ID (32 character hex)"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className={`mt-1 sm:mt-2 h-10 sm:h-11 font-mono text-xs sm:text-sm ${
                      themeMode === 'light' 
                        ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
                        : 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                    }`}
                    maxLength={32}
                  />
                </div>
                <div>
                  <Label htmlFor="joinPassword" className={`text-sm sm:text-base ${
                    themeMode === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    Password
                  </Label>
                  <Input
                    id="joinPassword"
                    type="password"
                    placeholder="Enter room password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    className={`mt-1 sm:mt-2 h-10 sm:h-11 ${
                      themeMode === 'light' 
                        ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
                        : 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                    }`}
                    onKeyPress={handleJoinKeyPress}
                    autoComplete="current-password"
                  />
                </div>
                <Button 
                  onClick={joinRoom}
                  disabled={isJoining || !roomId.trim() || !joinPassword.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 sm:h-11 text-sm sm:text-base disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </Button>
                <div className={`text-xs space-y-1 ${
                  themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <p>🔒 Security Features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>24-hour room expiration</li>
                    <li>10-minute message self-destruct</li>
                    <li>Anonymous random identities</li>
                    <li>Invisible mode for privacy</li>
                    <li>Emergency panic mode</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 sm:mt-12 text-center px-2 sm:px-4">
          <div className={`border rounded-lg p-3 sm:p-4 max-w-2xl mx-auto ${
            themeMode === 'light' 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              themeMode === 'light' ? 'text-yellow-800' : 'text-yellow-200'
            }`}>
              <strong>Security Notice:</strong> Messages are encrypted end-to-end and self-destruct after 10 minutes of being read. 
              Chat rooms automatically expire after 24 hours. All data is automatically deleted when you close the tab. 
              Never share sensitive information over any digital medium.
            </p>
          </div>
        </div>

        {/* QR Code Modal */}
        {createdRoom && (
          <QRCodeModal
            isOpen={showQRCode}
            onClose={() => setShowQRCode(false)}
            roomId={createdRoom.roomId}
            password={createdRoom.password}
          />
        )}
      </div>
    </div>
  );
}
