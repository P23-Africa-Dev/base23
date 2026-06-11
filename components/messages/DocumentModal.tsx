'use client';

import toast from 'react-hot-toast';
import { getDocumentIcon } from '@/utils/message-helpers';

type SelectedDocument = { url: string; name: string; type: string };

type Props = {
    show: boolean;
    document: SelectedDocument | null;
    onClose: () => void;
};

export default function DocumentModal({ show, document, onClose }: Props) {
    if (!show || !document) return null;

    const isPdf = document.type === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf');

    const handleDownload = () => {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        toast.success('Download started');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <h3 className="truncate text-lg font-semibold text-gray-900">{document.name}</h3>
                    <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {isPdf ? (
                        <div className="space-y-4">
                            <iframe src={document.url} className="h-96 w-full rounded-lg border border-gray-200" title={document.name} />
                            <p className="text-center text-sm text-gray-500">PDF preview (some features may not be available)</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-6xl">{getDocumentIcon(document.name)}</div>
                            <div className="text-center">
                                <h4 className="font-semibold text-gray-900">{document.name}</h4>
                                <p className="text-sm text-gray-500">{document.type || 'Document'}</p>
                            </div>
                            <p className="max-w-md text-center text-sm text-gray-500">
                                This file type cannot be previewed. You can download it to view the contents.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-4">
                    {isPdf && (
                        <button onClick={() => window.open(document.url, '_blank')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                            Open in New Tab
                        </button>
                    )}
                    <button onClick={handleDownload} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}
