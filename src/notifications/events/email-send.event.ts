import { DomainEvent } from "../../shared/events/domain-event";

export class EmailSendEvent extends DomainEvent {
  readonly eventType = "email.send";

  constructor(
    public readonly recipient: string,
    public readonly subject: string,
    public readonly template: string,
    public readonly context: any
  ) {
    super(recipient); // aggregateId is recipient email
  }

  protected getPayload() {
    return {
      recipient: this.recipient,
      subject: this.subject,
      template: this.template,
      context: this.context,
    };
  }
}
