import { toast } from 'react-toastify'; // or your toast library

// Notification utility for chat messages
export class ChatNotifications {
    private static isPermissionGranted = false;
    private static isInitialized = false;
    
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            toast.warning('This browser does not support desktop notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.isPermissionGranted = true;
            return true;
        }

        if (Notification.permission === 'denied') {
            toast.warning('Notification permission was previously denied');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.isPermissionGranted = permission === 'granted';
            toast.info(`Notification permission: ${permission}`);
            return this.isPermissionGranted;
        } catch (error) {
            toast.error('Error requesting notification permission');
            return false;
        }
    }

    static async showMessageNotification(senderName: string, messageBody: string, senderProfilePicture?: string) {
        if (document.visibilityState === 'visible') {
            return;
        }

        if (Notification.permission !== 'granted') {
            toast.info('No notification permission');
            return;
        }

        try {
            const truncatedMessage = messageBody.length > 100 
                ? messageBody.substring(0, 100) + '...' 
                : messageBody;

            const notification = new Notification(`New message from ${senderName}`, {
                body: truncatedMessage,
                icon: senderProfilePicture || '/images/favicon-noel-white.png',
                badge: '/images/favicon-noel-white.png',
                tag: `chat-message-${senderName}`,
                requireInteraction: false,
                silent: false,
            });

            setTimeout(() => {
                notification.close();
            }, 6000);

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

        } catch (error) {
            toast.error('Error creating notification');
        }
    }

    static async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        if (!this.isSupported()) {
            toast.warning('Notifications not supported in this browser');
            return;
        }

        this.isPermissionGranted = Notification.permission === 'granted';
        this.isInitialized = true;
        
        toast.success(`Notifications initialized. Permission: ${Notification.permission}`);
    }

    static isSupported(): boolean {
        return 'Notification' in window;
    }

    static getPermissionStatus(): string {
        if (!('Notification' in window)) {
            return 'unsupported';
        }
        return Notification.permission;
    }

    static needsPermission(): boolean {
        return this.isSupported() && Notification.permission === 'default';
    }

    static isBlocked(): boolean {
        return this.isSupported() && Notification.permission === 'denied';
    }
}
