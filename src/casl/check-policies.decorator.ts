import { SetMetadata } from "@nestjs/common";
import { Actions, Subjects } from "./casl-ability.factory";

export interface PolicyHandler {
  action: Actions;
  subject: Subjects;
}

export const CHECK_POLICIES_KEY = "check_policies";

/**
 * Decorator to specify required policies for a route
 * Usage: @CheckPolicies({ action: 'create', subject: 'Member' })
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
