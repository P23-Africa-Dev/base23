import images from '@/constants/image';
import React from 'react';

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnectAndMessage: () => void;
    userName: string;
    userImage?: string;
    isLoading?: boolean;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, onConnectAndMessage, userName, userImage, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="bg-opacity-20 absolute inset-0 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="p-6 pb-4 text-center">
                    <h2 className="text-xl font-bold text-gray-900">Connect to Message</h2>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center space-y-4 px-6 pb-6">
                    {/* User Avatar */}
                    <div className="relative">
                        <div
                            className="h-20 w-20 rounded-full bg-gray-200 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: userImage ? `url(${userImage})` : 'none',
                            }}
                        />
                        <div className="absolute -right-1 -bottom-1 rounded-full bg-white p-1 shadow-md">
                            <img src={images.connectLink} className="h-4 w-4" alt="Connect" />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="text-center">
                        <p className="mb-2 text-gray-600">
                            You need to connect with <span className="font-semibold text-gray-900">{userName}</span> before you can send messages.
                        </p>
                        <p className="text-sm text-gray-500">Connect first to send messages</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Close
                        </button>
                        <button
                            onClick={onConnectAndMessage}
                            className="flex-1 rounded-md bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF] px-4 py-2 text-white transition-all hover:from-[#9A6FE8] hover:to-[#C099FF]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Connecting...</span>
                                </div>
                            ) : (
                                'Connect Now & Start Message'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionModal;
