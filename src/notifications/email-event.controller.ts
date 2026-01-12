import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { sendEmail } from "../utils/email";

/**
 * Kafka Event Controller for handling email events.
 * Replaces the old email-event.handler.ts that used eventBus.subscribe()
 */
@Controller()
export class EmailEventController {
  @EventPattern("email.send")
  async handleEmailSend(@Payload() event: any) {
    const { recipient, subject, template, context } = event.payload || event;

    try {
      await sendEmail(subject, template, context, recipient);
      console.log(`[EmailEventHandler] Email sent to ${recipient}`);
    } catch (error) {
      console.error(
        `[EmailEventHandler] Failed to send email to ${recipient}:`,
        error
      );
    }
  }
}
