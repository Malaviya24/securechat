import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Camera } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface ScreenshotDetectorProps {
  isActive: boolean;
}

export default function ScreenshotDetector({ isActive }: ScreenshotDetectorProps) {
  const { toast } = useToast();
  const [screenshotDetected, setScreenshotDetected] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<string>('');

  useEffect(() => {
    if (!isActive) return;

    let detectionActive = true;
    let lastVisibilityChange = Date.now();
    let isTyping = false;

    // Track if user is actively typing
    const handleTyping = () => {
      isTyping = true;
      setTimeout(() => {
        isTyping = false;
      }, 1000);
    };

    // Method 1: Visibility API - detects when page becomes hidden/visible
    const handleVisibilityChange = () => {
      if (!detectionActive) return;
      
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange;
      lastVisibilityChange = now;
      
      if (document.hidden) {
        // Page became hidden - could be screenshot on some devices
        setTimeout(() => {
          if (!document.hidden && detectionActive && !isTyping && timeSinceLastChange > 500) {
            handleScreenshotDetected('Visibility API');
          }
        }, 200);
      }
    };

    // Method 2: Focus/Blur events - detects when window loses focus
    let lastBlur = 0;
    const handleBlur = () => {
      if (!detectionActive || isTyping) return;
      lastBlur = Date.now();
    };

    const handleFocus = () => {
      if (!detectionActive || isTyping) return;
      const now = Date.now();
      const blurDuration = now - lastBlur;
      
      // Only trigger if blur was brief (likely screenshot) and not due to typing
      if (lastBlur > 0 && blurDuration > 100 && blurDuration < 2000) {
        setTimeout(() => {
          if (detectionActive && !isTyping) {
            handleScreenshotDetected('Focus/Blur Detection');
          }
        }, 100);
      }
    };

    // Method 3: Screen capture API detection (modern browsers)
    const detectScreenCapture = async () => {
      if (!detectionActive) return;
      
      try {
        // @ts-ignore - getDisplayMedia is not in all TypeScript definitions
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          // Monitor for screen capture attempts
          const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
          navigator.mediaDevices.getDisplayMedia = function(...args) {
            if (detectionActive && !isTyping) {
              handleScreenshotDetected('Screen Capture API');
            }
            return originalGetDisplayMedia.apply(this, args);
          };
        }
      } catch (error) {
        // Screen capture API not available
      }
    };

    // Method 4: Canvas fingerprinting detection
    const detectCanvasFingerprinting = () => {
      if (!detectionActive) return;
      
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        if (detectionActive && !isTyping) {
          handleScreenshotDetected('Canvas Data Extraction');
        }
        return originalToDataURL.apply(this, args);
      };

      CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        if (detectionActive && !isTyping) {
          handleScreenshotDetected('Canvas Image Data Access');
        }
        return originalGetImageData.apply(this, args);
      };
    };

    const handleScreenshotDetected = (method: string) => {
      if (screenshotDetected || isTyping) return; // Prevent multiple alerts or false positives during typing
      
      setScreenshotDetected(true);
      setDetectionMethod(method);
      
      toast({
        title: "🚨 Screenshot Detected!",
        description: `Potential screenshot captured using ${method}. Your privacy may be compromised.`,
        variant: "destructive",
        duration: 8000,
      });

      // Reset detection after 5 seconds
      setTimeout(() => {
        setScreenshotDetected(false);
        setDetectionMethod('');
      }, 5000);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('keydown', handleTyping);
    document.addEventListener('input', handleTyping);

    // Initialize detection methods
    detectScreenCapture();
    detectCanvasFingerprinting();

    // Cleanup function
    return () => {
      detectionActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleTyping);
      document.removeEventListener('input', handleTyping);
    };
  }, [isActive, screenshotDetected, toast]);

  if (!screenshotDetected) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-md">
      <Alert className="bg-red-500/90 border-red-400 text-white backdrop-blur-md animate-pulse">
        <Camera className="h-4 w-4" />
        <AlertTitle className="text-white font-bold">Screenshot Detected!</AlertTitle>
        <AlertDescription className="text-red-100">
          Potential screenshot captured via {detectionMethod}. Your privacy may be compromised.
        </AlertDescription>
      </Alert>
    </div>
  );
}
