'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

function MarkdownInner({ content }: { content: string }) {
  return (
    <div className="msg-content">
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Не пере-парсим markdown на каждый ререндер AppShell — только когда content реально изменился.
export default memo(MarkdownInner, (prev, next) => prev.content === next.content);
