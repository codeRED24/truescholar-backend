import { Controller, Inject } from "@nestjs/common";
import { EventPattern, Payload, ClientKafka } from "@nestjs/microservices";
import { FirebaseService } from "./firebase.service";
import { UserDevicesService } from "./user-devices.service";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { PushNotificationPayload } from "./notifications.service";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 10000]; // 1s, 5s, 10s

@Controller()
export class PushNotificationConsumer {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userDevicesService: UserDevicesService,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
  ) {}

  @EventPattern("push.notification.send")
  async handlePushNotification(@Payload() payload: PushNotificationPayload) {
    const { userId, title, body, data, link, retryCount = 0 } = payload;

    // Check if Firebase is initialized
    if (!this.firebaseService.isInitialized()) {
      console.warn(
        "[PushConsumer] Firebase not initialized, skipping push notification",
      );
      return;
    }

    try {
      // Get user's device tokens
      const tokens = await this.userDevicesService.getUserTokens(userId);

      if (tokens.length === 0) {
        return;
      }

      // Send push notification
      const notificationPayload = {
        title,
        body,
        data: {
          ...data,
          url: link || "",
        },
      };

      const result = await this.firebaseService.sendMulticast(
        tokens,
        notificationPayload,
      );

      // console.log(
      //   `[PushConsumer] Push notification sent to user ${userId}: ${result.successCount} success, ${result.failureCount} failed`,
      // );

      // Remove invalid tokens immediately (permanent errors)
      if (result.invalidTokens.length > 0) {
        console.log(`Removing ${result.invalidTokens.length} invalid tokens`);
        await this.userDevicesService.removeInvalidTokens(result.invalidTokens);
      }

      // Handle retryable failures
      if (result.retryableTokens.length > 0) {
        if (retryCount < MAX_RETRIES) {
          const delay =
            RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          // console.log(
          //   `Retrying push notification for ${result.retryableTokens.length} tokens (attempt ${retryCount + 1}/${MAX_RETRIES}) in ${delay}ms`,
          // );

          // Schedule retry with delay
          setTimeout(() => {
            this.kafkaClient.emit("push.notification.send", {
              ...payload,
              retryCount: retryCount + 1,
            });
          }, delay);
        } else {
          // Max retries exceeded - send to DLQ
          // console.error(
          //   `Push notification failed after ${MAX_RETRIES} retries for user ${userId}. Moving to DLQ.`,
          // );
          this.kafkaClient.emit("push.notification.dlq", {
            ...payload,
            failedTokens: result.retryableTokens,
            error: "Max retries exceeded",
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      // console.error(
      //   `Error processing push notification for user ${userId}:`,
      //   error,
      // );

      // Retry on unexpected errors
      if (retryCount < MAX_RETRIES) {
        const delay =
          RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        // console.log(
        //   `Retrying after error (attempt ${retryCount + 1}/${MAX_RETRIES}) in ${delay}ms`,
        // );

        setTimeout(() => {
          this.kafkaClient.emit("push.notification.send", {
            ...payload,
            retryCount: retryCount + 1,
          });
        }, delay);
      } else {
        // Max retries exceeded - send to DLQ
        // console.error(
        //   `Push notification failed after ${MAX_RETRIES} retries. Moving to DLQ.`,
        // );
        this.kafkaClient.emit("push.notification.dlq", {
          ...payload,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  @EventPattern("push.notification.dlq")
  async handleDLQ(@Payload() payload: any) {
    // For now, just log. In production, you might want to:
    // - Send alerts to Slack/Discord
    // - Store in a separate table for review
    // - Send email to admins
    console.error("[DLQ] Push notification permanently failed:", {
      userId: payload.userId,
      title: payload.title,
      error: payload.error,
      failedTokens: payload.failedTokens,
      timestamp: payload.timestamp,
    });
  }
}
