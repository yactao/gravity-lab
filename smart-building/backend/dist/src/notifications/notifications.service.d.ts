export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';
export declare class NotificationsService {
    private readonly logger;
    sendNotification(organizationId: string | undefined, message: string, channels?: NotificationChannel[]): Promise<{
        success: boolean;
        dispatchedTo: NotificationChannel[];
        timestamp: string;
    }>;
}
