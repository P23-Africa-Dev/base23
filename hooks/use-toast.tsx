import * as React from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (props: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastCount}`;
        const newToast: Toast = { id, ...props };

        setToasts((prev) => [...prev, newToast]);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        // Return a no-op toast function if not wrapped in provider
        return {
            toast: (props: Omit<Toast, 'id'>) => {
                console.log('Toast:', props.title, props.description);
            },
            toasts: [],
            dismiss: () => { },
        };
    }
    return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`min-w-[300px] max-w-[420px] rounded-lg border p-4 shadow-lg transition-all duration-300 ${toast.variant === 'destructive'
                            ? 'border-red-200 bg-red-50 text-red-900'
                            : 'border-gray-200 bg-white text-gray-900'
                        }`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-sm font-semibold">{toast.title}</h4>
                            {toast.description && (
                                <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
