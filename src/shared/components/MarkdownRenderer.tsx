import type { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({
  content,
  className = '',
}: MarkdownRendererProps): JSX.Element => {
  return (
    <div className={`markdown-content text-white leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[]}
        skipHtml={false}
        components={{
          p: ({ children }) => (
            <p style={{ whiteSpace: 'pre-wrap' }}>{children}</p>
          ),
          div: ({ children }) => (
            <div style={{ whiteSpace: 'pre-wrap' }}>{children}</div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
