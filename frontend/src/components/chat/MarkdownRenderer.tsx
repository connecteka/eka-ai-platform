import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming }) => {
  // Simple markdown parser for common patterns
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let codeBlock = '';
    let codeLanguage = '';
    let inCodeBlock = false;
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={elements.length} className="list-disc list-inside space-y-1 my-3 text-text-primary">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{parseInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <div key={elements.length} className="my-4 rounded-lg overflow-hidden border border-border">
              <div className="bg-[#1e1e1e] px-4 py-2 text-xs text-text-secondary border-b border-border flex items-center justify-between">
                <span>{codeLanguage || 'code'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeBlock)}
                  className="px-2 py-1 hover:bg-[#2a2a2c] rounded text-xs transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-[#0d0d0d] p-4 overflow-x-auto">
                <code className="text-sm text-text-primary font-mono">{codeBlock}</code>
              </pre>
            </div>
          );
          codeBlock = '';
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          flushList();
          // Start code block
          codeLanguage = line.replace('```', '').trim();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlock += (codeBlock ? '\n' : '') + line;
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={elements.length} className="text-2xl font-bold my-4 text-text-primary">
            {parseInlineMarkdown(line.substring(2))}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={elements.length} className="text-xl font-semibold my-3 text-text-primary">
            {parseInlineMarkdown(line.substring(3))}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={elements.length} className="text-lg font-semibold my-3 text-text-primary">
            {parseInlineMarkdown(line.substring(4))}
          </h3>
        );
        return;
      }

      // Lists
      if (line.match(/^[\*\-\+]\s+/) || line.match(/^\d+\.\s+/)) {
        const content = line.replace(/^[\*\-\+\d\.]\s+/, '');
        listItems.push(content);
        inList = true;
        return;
      } else if (inList && line.trim()) {
        // Continue list item
        listItems[listItems.length - 1] += ' ' + line.trim();
        return;
      } else if (inList && !line.trim()) {
        flushList();
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={elements.length} className="border-l-4 border-brand-orange pl-4 my-3 text-text-secondary italic">
            {parseInlineMarkdown(line.substring(2))}
          </blockquote>
        );
        return;
      }

      // Horizontal rule
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        flushList();
        elements.push(<hr key={elements.length} className="my-4 border-border" />);
        return;
      }

      // Regular paragraphs
      if (line.trim()) {
        flushList();
        elements.push(
          <p key={elements.length} className="my-2 leading-relaxed text-text-primary">
            {parseInlineMarkdown(line)}
          </p>
        );
      } else if (!inCodeBlock && !inList) {
        elements.push(<br key={elements.length} />);
      }
    });

    // Flush any remaining list
    flushList();

    // Handle incomplete code block if streaming
    if (inCodeBlock && isStreaming) {
      elements.push(
        <div key={elements.length} className="my-4 rounded-lg overflow-hidden border border-border">
          <div className="bg-[#1e1e1e] px-4 py-2 text-xs text-text-secondary border-b border-border">
            {codeLanguage || 'code'}
          </div>
          <pre className="bg-[#0d0d0d] p-4 overflow-x-auto">
            <code className="text-sm text-text-primary font-mono">{codeBlock}</code>
          </pre>
        </div>
      );
    }

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let current = '';
    let i = 0;

    while (i < text.length) {
      // Bold **text**
      if (text.substr(i, 2) === '**') {
        if (current) {
          parts.push(current);
          current = '';
        }
        const end = text.indexOf('**', i + 2);
        if (end !== -1) {
          parts.push(
            <strong key={i} className="font-semibold">
              {text.substring(i + 2, end)}
            </strong>
          );
          i = end + 2;
          continue;
        }
      }

      // Italic *text*
      if (text[i] === '*' && text[i - 1] !== '*' && text[i + 1] !== '*') {
        if (current) {
          parts.push(current);
          current = '';
        }
        const end = text.indexOf('*', i + 1);
        if (end !== -1) {
          parts.push(
            <em key={i} className="italic">
              {text.substring(i + 1, end)}
            </em>
          );
          i = end + 1;
          continue;
        }
      }

      // Inline code `text`
      if (text[i] === '`') {
        if (current) {
          parts.push(current);
          current = '';
        }
        const end = text.indexOf('`', i + 1);
        if (end !== -1) {
          parts.push(
            <code
              key={i}
              className="bg-[#1e1e1e] text-brand-orange px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {text.substring(i + 1, end)}
            </code>
          );
          i = end + 1;
          continue;
        }
      }

      // Links [text](url)
      if (text[i] === '[') {
        const textEnd = text.indexOf(']', i);
        const urlStart = text.indexOf('(', textEnd);
        const urlEnd = text.indexOf(')', urlStart);
        if (textEnd !== -1 && urlStart === textEnd + 1 && urlEnd !== -1) {
          if (current) {
            parts.push(current);
            current = '';
          }
          const linkText = text.substring(i + 1, textEnd);
          const url = text.substring(urlStart + 1, urlEnd);
          parts.push(
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange hover:underline"
            >
              {linkText}
            </a>
          );
          i = urlEnd + 1;
          continue;
        }
      }

      current += text[i];
      i++;
    }

    if (current) {
      parts.push(current);
    }

    return parts.length === 0 ? text : parts;
  };

  return (
    <div className="markdown-content text-sm">
      {parseMarkdown(content)}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-brand-orange ml-0.5 animate-pulse"></span>
      )}
    </div>
  );
};

export default MarkdownRenderer;
