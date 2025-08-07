import React from 'react';
import type { TypingIndicator as TypingIndicatorType } from '~backend/chat/types';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
  currentUserNickname: string;
}

export default function TypingIndicator({ typingUsers, currentUserNickname }: TypingIndicatorProps) {
  // Filter out current user from typing indicators
  const otherTypingUsers = typingUsers.filter(user => user.user_nickname !== currentUserNickname);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-400 text-sm">
      <div className="flex items-center space-x-1">
        {otherTypingUsers.slice(0, 3).map((user, index) => (
          <span key={user.user_nickname} className="text-base">
            {user.user_avatar}
          </span>
        ))}
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-xs sm:text-sm">
          {otherTypingUsers.length === 1 
            ? `${otherTypingUsers[0].user_nickname} is typing`
            : otherTypingUsers.length === 2
            ? `${otherTypingUsers[0].user_nickname} and ${otherTypingUsers[1].user_nickname} are typing`
            : `${otherTypingUsers.length} people are typing`
          }
        </span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
