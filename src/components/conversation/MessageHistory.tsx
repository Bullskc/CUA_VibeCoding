import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/conversation';
import './MessageHistory.scss';

interface MessageHistoryProps {
  messages: Message[];
  isAISpeaking: boolean;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({
  messages,
  isAISpeaking,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="message-history">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.role === 'ai' ? 'ai-message' : 'user-message'
            }`}
          >
            <div className="message-avatar">
              {message.role === 'ai' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isAISpeaking && (
          <div className="message ai-message typing">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageHistory;
