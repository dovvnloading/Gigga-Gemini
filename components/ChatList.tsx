
import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { Message } from '../types';

interface ChatListProps {
  messages: Message[];
  onPlayAudio: (text: string) => void;
  onOpenCanvas: (content: string, language: string) => void;
  onRegenerate: () => void;
  onFork: (messageId: string) => void;
  onEditMessage: (newText: string) => void;
  userAvatar: string;
}

const ChatList: React.FC<ChatListProps> = ({ 
  messages, 
  onPlayAudio, 
  onOpenCanvas, 
  onRegenerate,
  onFork,
  onEditMessage,
  userAvatar 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-[800px] mx-auto w-full pt-20 pb-32 px-4">
         <div className="space-y-6">
            {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                // If the last message is an AI response, the previous one was the user
                const isLastUserMessage = (msg.role === 'user' && (index === messages.length - 1 || index === messages.length - 2));

                return (
                    <MessageItem 
                        key={msg.id} 
                        message={msg} 
                        onPlayAudio={onPlayAudio} 
                        onOpenCanvas={onOpenCanvas}
                        userAvatar={userAvatar}
                        isLast={isLast}
                        onRegenerate={msg.role === 'model' && isLast ? onRegenerate : undefined}
                        onFork={() => onFork(msg.id)}
                        onEdit={msg.role === 'user' && isLastUserMessage ? onEditMessage : undefined}
                    />
                );
            })}
        </div>
        <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatList;
