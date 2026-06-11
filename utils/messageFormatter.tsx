import React from 'react';

/**
 * Message Formatter Utility
 * Parses text and converts markdown-like syntax to React elements
 * 
 * Supported formatting:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - ~~strikethrough~~
 * - `code`
 * - [link text](url)
 * - Emoji support (native)
 * - Line breaks
 * - Lists (- item or * item or numbered 1. item)
 */

type FormattedPart = {
    type: 'text' | 'bold' | 'italic' | 'strikethrough' | 'code' | 'link' | 'emoji' | 'linebreak' | 'listItem' | 'numberedListItem';
    content: string;
    url?: string;
    number?: number;
};

// Common emoji patterns to preserve
const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

/**
 * Parse message text into formatted parts
 */
export function parseMessageText(text: string): FormattedPart[] {
    if (!text) return [];

    const parts: FormattedPart[] = [];
    const remaining = text;

    // Process line by line to handle lists
    const lines = remaining.split('\n');

    lines.forEach((line, lineIndex) => {
        // Check for list items
        const unorderedListMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
        const orderedListMatch = line.match(/^[\s]*(\d+)\.\s+(.+)$/);

        if (unorderedListMatch) {
            const listContent = parseInlineFormatting(unorderedListMatch[1]);
            parts.push({
                type: 'listItem',
                content: unorderedListMatch[1],
            });
        } else if (orderedListMatch) {
            parts.push({
                type: 'numberedListItem',
                content: orderedListMatch[2],
                number: parseInt(orderedListMatch[1]),
            });
        } else {
            // Parse inline formatting for non-list lines
            const inlineParts = parseInlineFormatting(line);
            parts.push(...inlineParts);
        }

        // Add line break between lines (except for last line)
        if (lineIndex < lines.length - 1) {
            parts.push({ type: 'linebreak', content: '' });
        }
    });

    return parts;
}

/**
 * Parse inline formatting (bold, italic, code, links, etc.)
 */
function parseInlineFormatting(text: string): FormattedPart[] {
    const parts: FormattedPart[] = [];
    const remaining = text;

    // Combined regex for all inline patterns
    const patterns = [
        { regex: /\*\*(.+?)\*\*/g, type: 'bold' as const },
        { regex: /__(.+?)__/g, type: 'bold' as const },
        { regex: /(?<!\*)\*([^*]+?)\*(?!\*)/g, type: 'italic' as const },
        { regex: /(?<!_)_([^_]+?)_(?!_)/g, type: 'italic' as const },
        { regex: /~~(.+?)~~/g, type: 'strikethrough' as const },
        { regex: /`([^`]+?)`/g, type: 'code' as const },
        { regex: /\[([^\]]+?)\]\(([^)]+?)\)/g, type: 'link' as const },
    ];

    // Find all matches with positions
    type Match = {
        index: number;
        length: number;
        type: FormattedPart['type'];
        content: string;
        url?: string;
    };

    const matches: Match[] = [];

    patterns.forEach(({ regex, type }) => {
        let match;
        const regexCopy = new RegExp(regex.source, regex.flags);
        while ((match = regexCopy.exec(text)) !== null) {
            if (type === 'link') {
                matches.push({
                    index: match.index,
                    length: match[0].length,
                    type,
                    content: match[1],
                    url: match[2],
                });
            } else {
                matches.push({
                    index: match.index,
                    length: match[0].length,
                    type,
                    content: match[1],
                });
            }
        }
    });

    // Sort matches by position
    matches.sort((a, b) => a.index - b.index);

    // Remove overlapping matches (keep first)
    const filteredMatches: Match[] = [];
    let lastEnd = 0;

    matches.forEach((match) => {
        if (match.index >= lastEnd) {
            filteredMatches.push(match);
            lastEnd = match.index + match.length;
        }
    });

    // Build parts array
    let currentIndex = 0;

    filteredMatches.forEach((match) => {
        // Add text before this match
        if (match.index > currentIndex) {
            const textBefore = text.slice(currentIndex, match.index);
            if (textBefore) {
                parts.push({ type: 'text', content: textBefore });
            }
        }

        // Add the formatted part
        parts.push({
            type: match.type,
            content: match.content,
            url: match.url,
        });

        currentIndex = match.index + match.length;
    });

    // Add remaining text
    if (currentIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
    }

    // If no matches found, return the whole text
    if (parts.length === 0 && text) {
        parts.push({ type: 'text', content: text });
    }

    return parts;
}

/**
 * FormattedMessage Component
 * Renders a message with formatting applied
 */
interface FormattedMessageProps {
    text: string;
    className?: string;
    isLight?: boolean; // For messages on dark backgrounds
    searchHighlight?: string; // Optional search term to highlight
}

export function FormattedMessage({ text, className = '', isLight = false, searchHighlight }: FormattedMessageProps) {
    if (!text) return null;

    const parts = parseMessageText(text);

    // Helper to highlight search terms
    const highlightText = (content: string): React.ReactNode => {
        if (!searchHighlight || !searchHighlight.trim()) {
            return content;
        }

        const regex = new RegExp(`(${searchHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const segments = content.split(regex);

        return segments.map((segment, i) => {
            if (segment.toLowerCase() === searchHighlight.toLowerCase()) {
                return (
                    <mark key={i} className="rounded bg-yellow-300 px-0.5 text-black">
                        {segment}
                    </mark>
                );
            }
            return segment;
        });
    };

    const renderPart = (part: FormattedPart, index: number): React.ReactNode => {
        const content = searchHighlight ? highlightText(part.content) : part.content;

        switch (part.type) {
            case 'bold':
                return (
                    <strong key={index} className="font-bold">
                        {content}
                    </strong>
                );

            case 'italic':
                return (
                    <em key={index} className="italic">
                        {content}
                    </em>
                );

            case 'strikethrough':
                return (
                    <del key={index} className="line-through opacity-70">
                        {content}
                    </del>
                );

            case 'code':
                return (
                    <code
                        key={index}
                        className={`rounded px-1.5 py-0.5 font-mono text-[0.9em] ${isLight
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        {content}
                    </code>
                );

            case 'link':
                return (
                    <a
                        key={index}
                        href={part.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline hover:opacity-80 ${isLight ? 'text-blue-200' : 'text-blue-600'
                            }`}
                    >
                        {content}
                    </a>
                );

            case 'linebreak':
                return <br key={index} />;

            case 'listItem':
                return (
                    <div key={index} className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">•</span>
                        <span>{content}</span>
                    </div>
                );

            case 'numberedListItem':
                return (
                    <div key={index} className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">{part.number}.</span>
                        <span>{content}</span>
                    </div>
                );

            case 'text':
            default:
                return <span key={index}>{content}</span>;
        }
    };

    return (
        <span className={`whitespace-pre-wrap break-words ${className}`}>
            {parts.map((part, index) => renderPart(part, index))}
        </span>
    );
}

/**
 * Simple text formatter for previews (strips formatting, keeps text)
 */
export function stripFormatting(text: string): string {
    if (!text) return '';

    return text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/~~(.+?)~~/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1');
}

export default FormattedMessage;
