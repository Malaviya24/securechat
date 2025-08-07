import { useState, useEffect, useCallback } from 'react';
import { E2EEncryption } from '../utils/encryption';

interface EncryptionState {
  isSupported: boolean;
  encryptionKey: CryptoKey | null;
  isKeyReady: boolean;
  error: string | null;
}

export function useEncryption(roomId: string, password: string) {
  const [state, setState] = useState<EncryptionState>({
    isSupported: E2EEncryption.isSupported(),
    encryptionKey: null,
    isKeyReady: false,
    error: null,
  });

  // Initialize encryption key when room and password are available
  useEffect(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'End-to-end encryption is not supported in this browser'
      }));
      return;
    }

    if (!roomId || !password) {
      return;
    }

    const initializeKey = async () => {
      try {
        setState(prev => ({ ...prev, error: null }));
        
        // Use room ID as salt for key derivation
        const key = await E2EEncryption.deriveKeyFromPassword(password, roomId);
        
        setState(prev => ({
          ...prev,
          encryptionKey: key,
          isKeyReady: true,
        }));
      } catch (error) {
        console.error('Failed to initialize encryption key:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize encryption',
          isKeyReady: false,
        }));
      }
    };

    initializeKey();
  }, [roomId, password, state.isSupported]);

  // Encrypt a message
  const encryptMessage = useCallback(async (message: string): Promise<string> => {
    if (!state.encryptionKey) {
      throw new Error('Encryption key not ready');
    }

    if (!state.isSupported) {
      // Fallback: return message as-is if encryption not supported
      return message;
    }

    try {
      return await E2EEncryption.encrypt(message, state.encryptionKey);
    } catch (error) {
      console.error('Failed to encrypt message:', error);
      throw new Error('Failed to encrypt message');
    }
  }, [state.encryptionKey, state.isSupported]);

  // Decrypt a message
  const decryptMessage = useCallback(async (encryptedMessage: string): Promise<string> => {
    if (!state.encryptionKey) {
      throw new Error('Encryption key not ready');
    }

    if (!state.isSupported) {
      // Fallback: return message as-is if encryption not supported
      return encryptedMessage;
    }

    try {
      return await E2EEncryption.decrypt(encryptedMessage, state.encryptionKey);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      // Return a placeholder for failed decryption
      return '[Message could not be decrypted]';
    }
  }, [state.encryptionKey, state.isSupported]);

  return {
    isSupported: state.isSupported,
    isKeyReady: state.isKeyReady,
    error: state.error,
    encryptMessage,
    decryptMessage,
  };
}
