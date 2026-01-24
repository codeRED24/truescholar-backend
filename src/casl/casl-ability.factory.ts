import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { UserRole, CollegeRole } from "../common/enums";

// Define subjects (resources) that can be acted upon
export type Subjects =
  | "College"
  | "Member"
  | "Invitation"
  | "Review"
  | "Content"
  | "all";

// Define possible actions
export type Actions = "manage" | "create" | "read" | "update" | "delete";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export interface UserContext {
  id: string;
  role: UserRole;
  college_id?: number;
}

export interface MemberContext {
  userId: string;
  collegeId: number;
  role: CollegeRole;
}

@Injectable()
export class CaslAbilityFactory {
  /**
   * Create abilities for a user, optionally scoped to a specific college membership
   */
  createForUser(user: UserContext, membership?: MemberContext): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    // Platform admin has full access to everything
    if (user.role === UserRole.ADMIN) {
      can("manage", "all");
      return build();
    }

    // If no membership context, user has limited read access
    if (!membership) {
      can("read", "College");
      return build();
    }

    // College-level permissions based on membership role
    switch (membership.role) {
      case CollegeRole.COLLEGE_ADMIN:
        // College admin can manage their college
        can("manage", "Member");
        can("manage", "Invitation");
        can("manage", "Content");
        can("read", "College");
        can("update", "College");
        can("manage", "Review");
        break;

      case CollegeRole.STUDENT:
      case CollegeRole.ALUMNI:
        // Students and alumni can read and create reviews
        can("read", "College");
        can("read", "Member");
        can("create", "Review");
        can("update", "Review"); // Will add condition for own reviews
        can("delete", "Review"); // Will add condition for own reviews
        break;
    }

    return build();
  }
}
