import { Injectable, OnModuleInit } from "@nestjs/common";
import * as admin from "firebase-admin";

// Error codes that indicate the token is permanently invalid
const PERMANENT_ERROR_CODES = [
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
  "messaging/invalid-argument",
];

// Error codes that indicate a temporary failure (should retry)
const TEMPORARY_ERROR_CODES = [
  "messaging/internal-error",
  "messaging/server-unavailable",
  "messaging/quota-exceeded",
  "messaging/message-rate-exceeded",
];

export interface SendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[]; // Tokens that should be deleted (permanent errors)
  retryableTokens: string[]; // Tokens that failed due to temporary errors
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private initialized = false;

  onModuleInit() {
    if (!this.initialized) {
      try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",
        );

        if (projectId && clientEmail && privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
          this.initialized = true;
          console.log("Firebase Admin initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
      }
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async sendMulticast(
    tokens: string[],
    notification: { title: string; body: string; data?: any },
  ): Promise<SendResult> {
    if (!this.initialized || tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
        retryableTokens: [],
      };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data ? this.stringifyData(notification.data) : {},
        // Web push specific configuration
        webpush: {
          headers: {
            Urgency: "high",
          },
          notification: {
            title: notification.title,
            body: notification.body,
            icon: "/icon.png",
            badge: "/icon.png",
            requireInteraction: true, // Notification stays until user interacts
          },
          fcmOptions: {
            link: notification.data?.url || "/feed/notifications",
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      const invalidTokens: string[] = [];
      const retryableTokens: string[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;

          if (PERMANENT_ERROR_CODES.includes(errorCode)) {
            invalidTokens.push(tokens[idx]);
          } else if (TEMPORARY_ERROR_CODES.includes(errorCode)) {
            retryableTokens.push(tokens[idx]);
          } else {
            // Unknown error - treat as retryable to be safe
            console.warn(
              `Unknown Firebase error code: ${errorCode}`,
              resp.error,
            );
            retryableTokens.push(tokens[idx]);
          }
        }
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
        retryableTokens,
      };
    } catch (error) {
      console.error("Error sending push notification:", error);
      // Network/connection error - all tokens should be retried
      return {
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
        retryableTokens: tokens,
      };
    }
  }

  private stringifyData(data: any): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        // Firebase data payload values must be strings
        result[key] =
          typeof data[key] === "object"
            ? JSON.stringify(data[key])
            : String(data[key]);
      }
    }
    return result;
  }
}
