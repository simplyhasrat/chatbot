import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownParserProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownParserProps> = ({ content }) => {
  // Split content into blocks: code blocks vs standard text
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <div key={`text-${lastIndex}`} className="space-y-3">
          {renderFormattedText(textBefore)}
        </div>
      );
    }

    const language = match[1] || 'text';
    const code = match[2];
    parts.push(
      <CodeSnippet key={`code-${match.index}`} code={code} language={language} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(
      <div key={`text-${lastIndex}`} className="space-y-3">
        {renderFormattedText(remainingText)}
      </div>
    );
  }

  return <div className="markdown-body space-y-3 text-sm md:text-base leading-relaxed">{parts}</div>;
};

// Code block component with language tag and copy button
const CodeSnippet: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-sage-200/80 dark:border-forest-800 shadow-sm bg-[#1E2922] text-sage-100 font-mono text-xs md:text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#17211B] border-b border-[#233427] text-sage-300">
        <div className="flex items-center space-x-2">
          <Terminal size={14} className="text-sage-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-sage-300">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs text-sage-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sage-50 leading-relaxed font-mono">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

// Parse paragraphs, bold, lists, tables, inline code, headings, blockquotes
function renderFormattedText(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { ordered: boolean; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.ordered) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-1.5 my-2 marker:text-sage-600 dark:marker:text-sage-400">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1.5 my-2 marker:text-sage-500 dark:marker:text-sage-400">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
    }
  };

  const flushTable = () => {
    if (currentTable) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3 rounded-xl border border-sage-200 dark:border-forest-800">
          <table className="min-w-full divide-y divide-sage-200 dark:divide-forest-800 text-xs sm:text-sm">
            <thead className="bg-sage-100/70 dark:bg-forest-850">
              <tr>
                {currentTable.headers.map((h, idx) => (
                  <th key={idx} className="px-3.5 py-2 text-left font-semibold text-sage-900 dark:text-sage-100">
                    {formatInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-forest-850 bg-white dark:bg-forest-900">
              {currentTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-sage-50/50 dark:hover:bg-forest-850/50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-sage-800 dark:text-sage-200">
                      {formatInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Markdown Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Check if it's separator row (e.g. |---|---|)
      const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));
      if (isSeparator) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-3 border-sage-200 dark:border-forest-800" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="text-base font-semibold text-sage-900 dark:text-sage-100 pt-2 pb-1">
          {formatInline(trimmed.substring(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold text-sage-900 dark:text-sage-100 pt-3 pb-1 border-b border-sage-100 dark:border-forest-800">
          {formatInline(trimmed.substring(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold text-sage-950 dark:text-white pt-3 pb-1">
          {formatInline(trimmed.substring(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="pl-3.5 py-1.5 my-2 border-l-4 border-sage-500 dark:border-sage-600 bg-sage-50/70 dark:bg-forest-900/50 rounded-r-lg italic text-sage-800 dark:text-sage-200"
        >
          {formatInline(trimmed.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List item
    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(unorderedMatch[2]);
      continue;
    }

    // Ordered List item
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    // Regular line / paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();
  return elements;
}

// Format inline code `code`, bold **text**, italic *text*, links [label](url)
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`inline-code-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-xs bg-sage-100 text-sage-800 dark:bg-forest-800 dark:text-sage-200 border border-sage-200/60 dark:border-forest-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-sage-950 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-sage-800 dark:text-sage-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const closeBracket = token.indexOf('](');
      const label = token.slice(1, closeBracket);
      const url = token.slice(closeBracket + 2, -1);
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sage-700 dark:text-sage-300 underline underline-offset-2 hover:text-sage-900 dark:hover:text-sage-100 font-medium"
        >
          {label}
        </a>
      );
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}
