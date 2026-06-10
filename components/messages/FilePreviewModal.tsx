'use client';

import { getDocumentIcon, formatFileSize } from '@/utils/message-helpers';

type Props = {
    show: boolean;
    file: File | null;
    fileType: 'image' | 'document' | 'voice' | null;
    fileUrl: string | null;
    uploadingFile: boolean;
    onSend: () => void;
    onCancel: () => void;
};

export default function FilePreviewModal({ show, file, fileType, fileUrl, uploadingFile, onSend, onCancel }: Props) {
    if (!show || !file || !fileUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onCancel}>
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">Preview {fileType === 'image' ? 'Image' : 'Document'}</h3>
                    <button onClick={onCancel} className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    {fileType === 'image' ? (
                        <img src={fileUrl} alt="Preview" className="h-auto max-h-[60vh] w-auto max-w-[80vw] rounded-lg object-contain" />
                    ) : (
                        <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-6">
                            <div className="text-4xl">{getDocumentIcon(file.name)}</div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{file.name}</h4>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-4">
                    <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={onSend} disabled={uploadingFile} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                        {uploadingFile ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
