import React from 'react';
import QRCode from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  password: string;
}

export default function QRCodeModal({ isOpen, onClose, roomId, password }: QRCodeModalProps) {
  const { toast } = useToast();
  
  const roomUrl = `${window.location.origin}/chat/${roomId}`;
  const shareData = JSON.stringify({ url: roomUrl, password });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`Room: ${roomUrl}\nPassword: ${password}`);
      toast({
        title: "Copied!",
        description: "Room details copied to clipboard",
      });
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      toast({
        title: "Room Details",
        description: `Room: ${roomUrl}\nPassword: ${password}`,
      });
    }
  };

  const getQRSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 160 : 200;
    }
    return 200;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/20 text-white w-[95vw] max-w-md sm:max-w-lg mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl">Share Chat Room</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-300 text-sm sm:text-base">
            Scan the QR code or copy the room details to share securely
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg">
            <QRCode 
              value={shareData} 
              size={getQRSize()} 
              className="block"
              level="M"
            />
          </div>
          
          <div className="w-full space-y-2 text-sm">
            <div>
              <span className="text-gray-400 text-xs sm:text-sm">Room URL:</span>
              <div className="bg-white/10 p-2 rounded font-mono text-xs break-all">
                {roomUrl}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs sm:text-sm">Password:</span>
              <div className="bg-white/10 p-2 rounded font-mono text-xs break-all">
                {password}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={copyToClipboard} 
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Room Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
