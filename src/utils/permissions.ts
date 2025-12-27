import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";

// Define custom statements/permissions for TrueScholar platform
export const statement = {
  ...defaultStatements,
  college: ["view", "update", "manage-courses", "manage-placements"],
  review: ["create", "update", "delete", "moderate"],
  course: ["view", "create", "update", "delete"],
  content: ["view", "create", "update", "delete", "publish"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  ...ownerAc.statements,
  college: ["view", "update", "manage-courses", "manage-placements"],
  review: ["create", "update", "delete", "moderate"],
  course: ["view", "create", "update", "delete"],
  content: ["view", "create", "update", "delete", "publish"],
});

export const collegeAdmin = ac.newRole({
  ...adminAc.statements,
  college: ["view", "update", "manage-courses", "manage-placements"],
  review: ["create", "update", "delete", "moderate"],
  course: ["view", "create", "update", "delete"],
  content: ["view", "create", "update", "delete", "publish"],
});

export const student = ac.newRole({
  ...memberAc.statements,
  college: ["view"],
  review: ["create", "update"],
  course: ["view"],
  content: ["view"],
});

export const alumni = ac.newRole({
  ...memberAc.statements,
  college: ["view"],
  review: ["create", "update"],
  course: ["view"],
  content: ["view"],
});

export const roles = {
  owner,
  admin: collegeAdmin,
  student,
  alumni,
};
