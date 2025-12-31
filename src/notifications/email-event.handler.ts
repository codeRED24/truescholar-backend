import { Injectable, OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { sendEmail } from "../utils/email";

@Injectable()
export class EmailEventHandler implements OnModuleInit {
  constructor(@Inject(EVENT_BUS) private readonly eventBus: IEventBus) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      "email.send",
      this.handleEmailSend.bind(this)
    );
  }

  private async handleEmailSend(event: any) {
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
