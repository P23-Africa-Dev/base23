/**
 * Chat debugging utilities for better troubleshooting and development
 */

export class ChatDebugger {
    private static instance: ChatDebugger;
    private isEnabled: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private logs: Array<{ timestamp: string; level: string; message: string; data?: any }> = [];

    private constructor() {
        this.isEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CHAT_DEBUG === 'true';
    }

    public static getInstance(): ChatDebugger {
        if (!ChatDebugger.instance) {
            ChatDebugger.instance = new ChatDebugger();
        }
        return ChatDebugger.instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, data };

        this.logs.push(logEntry);

        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs.shift();
        }

        if (this.isEnabled) {
            const emoji = this.getEmoji(level);
            const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

            if (data) {
                consoleMethod(`${emoji} [CHAT] ${message}`, data);
            } else {
                consoleMethod(`${emoji} [CHAT] ${message}`);
            }
        }
    }

    private getEmoji(level: string): string {
        switch (level) {
            case 'info':
                return '📘';
            case 'warn':
                return '⚠️';
            case 'error':
                return '❌';
            case 'debug':
                return '🔍';
            default:
                return '📝';
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public info(message: string, data?: any) {
        this.log('info', message, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error(message: string, data?: any) {
        this.log('error', message, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public debug(message: string, data?: any) {
        this.log('debug', message, data);
    }

    public getLogs() {
        return this.logs;
    }

    public clearLogs() {
        this.logs = [];
    }

    public exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    // Conversation debugging helpers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public logConversationState(conversationId: string, state: any) {
        this.debug(`Conversation ${conversationId} state:`, state);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public logMessageEvent(eventType: string, messageId: number, data?: any) {
        this.info(`Message event: ${eventType}`, { messageId, ...data });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public logEchoEvent(eventName: string, channelName: string, data?: any) {
        this.debug(`Echo event: ${eventName} on ${channelName}`, data);
    }

    public logApiCall(method: string, url: string, status?: number, duration?: number) {
        const data = { method, url, status, duration };
        if (status && status >= 400) {
            this.error('API call failed', data);
        } else {
            this.info('API call', data);
        }
    }
}

// Export singleton instance
export const chatDebugger = ChatDebugger.getInstance();

// Conversation state tracker
export class ConversationTracker {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static conversations = new Map<string, any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static updateConversation(encryptedId: string, data: any) {
        this.conversations.set(encryptedId, {
            ...this.conversations.get(encryptedId),
            ...data,
            lastUpdated: new Date().toISOString(),
        });
        chatDebugger.logConversationState(encryptedId, this.conversations.get(encryptedId));
    }

    public static getConversation(encryptedId: string) {
        return this.conversations.get(encryptedId);
    }

    public static getAllConversations() {
        return Array.from(this.conversations.entries());
    }

    public static clearConversation(encryptedId: string) {
        this.conversations.delete(encryptedId);
        chatDebugger.info(`Cleared conversation ${encryptedId} from tracker`);
    }
}

// Performance monitoring
export class ChatPerformanceMonitor {
    private static timers = new Map<string, number>();

    public static startTimer(label: string) {
        this.timers.set(label, performance.now());
    }

    public static endTimer(label: string) {
        const startTime = this.timers.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.timers.delete(label);
            chatDebugger.info(`Performance: ${label} took ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    }

    public static measureApiCall<T>(label: string, apiCall: () => Promise<T>): Promise<T> {
        this.startTimer(label);
        return apiCall().finally(() => {
            this.endTimer(label);
        });
    }
}
