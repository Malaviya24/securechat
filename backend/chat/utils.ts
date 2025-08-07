import * as crypto from 'crypto';

export function generateRoomId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const [salt, hash] = parts;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

const adjectives = [
  'Silent', 'Shadow', 'Mystic', 'Phantom', 'Stealth', 'Ghost', 'Ninja', 'Secret',
  'Hidden', 'Cosmic', 'Digital', 'Cyber', 'Quantum', 'Neon', 'Electric', 'Atomic'
];

const animals = [
  'Tiger', 'Wolf', 'Eagle', 'Panther', 'Fox', 'Raven', 'Falcon', 'Shark',
  'Dragon', 'Phoenix', 'Viper', 'Lynx', 'Hawk', 'Cobra', 'Jaguar', 'Owl'
];

const avatars = [
  '🦊', '🐱', '🐺', '🦅', '🐯', '🦈', '🐉', '🦉', '🐍', '🦎', '🐙', '🦋',
  '🐝', '🦇', '🐧', '🦜', '🦚', '🦢', '🦭', '🐨', '🐼', '🦘', '🦥', '🦦'
];

export function generateRandomNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${animal}${number}`;
}

export function generateRandomAvatar(): string {
  return avatars[Math.floor(Math.random() * avatars.length)];
}
