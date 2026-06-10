'use client';

import toast from 'react-hot-toast';

type Props = {
    show: boolean;
    imageUrl: string | null;
    onClose: () => void;
};

export default function ImageModal({ show, imageUrl, onClose }: Props) {
    if (!show || !imageUrl) return null;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg">
                <img
                    src={imageUrl}
                    alt="Full size image"
                    className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
                <button onClick={onClose} className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70">
                    ✕
                </button>
                <button onClick={handleDownload} className="absolute right-4 bottom-4 rounded-full bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
                    Download
                </button>
            </div>
        </div>
    );
}
