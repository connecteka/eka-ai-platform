import React from 'react';
import { User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from './ClaudeLikeChat';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex gap-4 mb-6 justify-end">
        <div className="max-w-[85%]">
          <div className="bg-background-alt border border-border rounded-2xl px-4 py-3">
            <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 px-2 justify-end">
            <span className="text-xs text-text-secondary">{formatTime(message.timestamp)}</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2a2a2c] border border-border flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-text-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-6">
      <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">E</span>
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={message.content} isStreaming={message.isStreaming} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-text-secondary">{formatTime(message.timestamp)}</span>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-background-alt rounded transition-colors text-text-secondary hover:text-text-primary"
              title={copied ? 'Copied!' : 'Copy message'}
            >
              <Copy size={14} />
            </button>
            <button
              className="p-1.5 hover:bg-background-alt rounded transition-colors text-text-secondary hover:text-text-primary"
              title="Good response"
            >
              <ThumbsUp size={14} />
            </button>
            <button
              className="p-1.5 hover:bg-background-alt rounded transition-colors text-text-secondary hover:text-text-primary"
              title="Bad response"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
