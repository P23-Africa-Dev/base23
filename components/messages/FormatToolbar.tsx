import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormatToolbarProps {
    text: string;
    setText: (text: string) => void;
    inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    className?: string;
}

type FormatType = 'bold' | 'italic' | 'strikethrough' | 'code' | 'link' | 'list' | 'numberedList';

interface FormatButton {
    type: FormatType;
    icon: React.ReactNode;
    label: string;
    prefix: string;
    suffix: string;
}

const formatButtons: FormatButton[] = [
    {
        type: 'bold',
        icon: <span className="font-bold">B</span>,
        label: 'Bold',
        prefix: '**',
        suffix: '**',
    },
    {
        type: 'italic',
        icon: <span className="italic">I</span>,
        label: 'Italic',
        prefix: '*',
        suffix: '*',
    },
    {
        type: 'strikethrough',
        icon: <span className="line-through">S</span>,
        label: 'Strikethrough',
        prefix: '~~',
        suffix: '~~',
    },
    {
        type: 'code',
        icon: <span className="font-mono text-xs">&lt;/&gt;</span>,
        label: 'Code',
        prefix: '`',
        suffix: '`',
    },
];

export function FormatToolbar({ text, setText, inputRef, className = '' }: FormatToolbarProps) {
    const [showToolbar, setShowToolbar] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);

    // Get current selection from input
    const getSelection = (): { start: number; end: number; text: string } => {
        const input = inputRef?.current;
        if (input) {
            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? 0;
            return {
                start,
                end,
                text: text.substring(start, end),
            };
        }
        return { start: text.length, end: text.length, text: '' };
    };

    // Apply formatting to selected text or insert at cursor
    const applyFormat = (format: FormatButton) => {
        const { start, end, text: selected } = getSelection();

        let newText: string;
        let newCursorPos: number;

        if (selected) {
            // Wrap selected text
            newText = text.substring(0, start) + format.prefix + selected + format.suffix + text.substring(end);
            newCursorPos = start + format.prefix.length + selected.length + format.suffix.length;
        } else {
            // Insert placeholder at cursor
            const placeholder = format.type === 'link' ? 'text' : format.type;
            newText = text.substring(0, start) + format.prefix + placeholder + format.suffix + text.substring(end);
            newCursorPos = start + format.prefix.length + placeholder.length;
        }

        setText(newText);

        // Restore focus and cursor position
        setTimeout(() => {
            const input = inputRef?.current;
            if (input) {
                input.focus();
                input.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    // Insert list item
    const insertList = (numbered: boolean = false) => {
        const { start } = getSelection();

        // Find the start of the current line
        const beforeCursor = text.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const isStartOfLine = start === lineStart || beforeCursor.endsWith('\n');

        let prefix = numbered ? '1. ' : '- ';
        if (!isStartOfLine) {
            prefix = '\n' + prefix;
        }

        const newText = text.substring(0, start) + prefix + text.substring(start);
        setText(newText);

        // Restore focus
        setTimeout(() => {
            const input = inputRef?.current;
            if (input) {
                input.focus();
                const newPos = start + prefix.length;
                input.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    // Open link modal
    const openLinkModal = () => {
        const { start, end, text: selected } = getSelection();
        setSelectedText(selected);
        setLinkText(selected);
        setSelectionStart(start);
        setSelectionEnd(end);
        setLinkUrl('');
        setShowLinkModal(true);
    };

    // Insert link
    const insertLink = () => {
        if (!linkUrl.trim()) return;

        const displayText = linkText.trim() || linkUrl;
        const linkMarkdown = `[${displayText}](${linkUrl})`;

        const newText = text.substring(0, selectionStart) + linkMarkdown + text.substring(selectionEnd);
        setText(newText);
        setShowLinkModal(false);
        setLinkText('');
        setLinkUrl('');

        // Restore focus
        setTimeout(() => {
            const input = inputRef?.current;
            if (input) {
                input.focus();
            }
        }, 0);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Format Toggle Button */}
            <button
                type="button"
                onClick={() => setShowToolbar(!showToolbar)}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${showToolbar
                        ? 'bg-[#6E28D9] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                title="Formatting options"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
            </button>

            {/* Toolbar Dropdown */}
            <AnimatePresence>
                {showToolbar && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 z-50 mb-2 flex items-center gap-1 rounded-xl bg-white p-2 shadow-lg ring-1 ring-gray-200"
                    >
                        {/* Format buttons */}
                        {formatButtons.map((btn) => (
                            <button
                                key={btn.type}
                                type="button"
                                onClick={() => applyFormat(btn)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#6E28D9]"
                                title={btn.label}
                            >
                                {btn.icon}
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="mx-1 h-6 w-px bg-gray-200" />

                        {/* Link button */}
                        <button
                            type="button"
                            onClick={openLinkModal}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#6E28D9]"
                            title="Insert Link"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div className="mx-1 h-6 w-px bg-gray-200" />

                        {/* List button */}
                        <button
                            type="button"
                            onClick={() => insertList(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#6E28D9]"
                            title="Bullet List"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Numbered list button */}
                        <button
                            type="button"
                            onClick={() => insertList(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#6E28D9]"
                            title="Numbered List"
                        >
                            <span className="text-xs font-medium">1.</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Link Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
                        onClick={() => setShowLinkModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="mb-4 text-lg font-semibold text-gray-800">Insert Link</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                        Display Text
                                    </label>
                                    <input
                                        type="text"
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        placeholder="Link text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#6E28D9] focus:outline-none focus:ring-1 focus:ring-[#6E28D9]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                        URL
                                    </label>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#6E28D9] focus:outline-none focus:ring-1 focus:ring-[#6E28D9]"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={insertLink}
                                    disabled={!linkUrl.trim()}
                                    className="rounded-lg bg-[#6E28D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a21b3] disabled:opacity-50"
                                >
                                    Insert
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Compact inline format buttons for mobile
 */
interface InlineFormatButtonsProps {
    text: string;
    setText: (text: string) => void;
    inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

export function InlineFormatButtons({ text, setText, inputRef }: InlineFormatButtonsProps) {
    const applyQuickFormat = (prefix: string, suffix: string) => {
        const input = inputRef?.current;
        if (!input) return;

        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const selected = text.substring(start, end);

        let newText: string;
        if (selected) {
            newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
        } else {
            newText = text.substring(0, start) + prefix + suffix + text.substring(end);
        }

        setText(newText);

        setTimeout(() => {
            input.focus();
            const newPos = selected
                ? start + prefix.length + selected.length + suffix.length
                : start + prefix.length;
            input.setSelectionRange(newPos, newPos);
        }, 0);
    };

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => applyQuickFormat('**', '**')}
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-[#6E28D9]"
                title="Bold"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => applyQuickFormat('*', '*')}
                className="flex h-6 w-6 items-center justify-center rounded text-xs italic text-gray-500 hover:bg-gray-100 hover:text-[#6E28D9]"
                title="Italic"
            >
                I
            </button>
            <button
                type="button"
                onClick={() => applyQuickFormat('`', '`')}
                className="flex h-6 w-6 items-center justify-center rounded font-mono text-[10px] text-gray-500 hover:bg-gray-100 hover:text-[#6E28D9]"
                title="Code"
            >
                {'</>'}
            </button>
        </div>
    );
}

export default FormatToolbar;
