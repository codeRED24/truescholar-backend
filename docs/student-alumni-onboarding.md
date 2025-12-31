# Student/Alumni Onboarding - Implementation Details

## Overview

Three onboarding paths for students and alumni to join colleges on TrueScholar.

---

## Flow 1: Bulk Import by College Admin

### User Story

> As a **college admin**, I want to upload a CSV/XLS file with student emails and phone numbers, so that invitations are automatically sent via email and WhatsApp.

### Process

1. Admin uploads CSV/XLS file via dashboard
2. System parses file, validates data
3. Creates `Invitation` records for each row
4. Sends email invite (with magic link)
5. Sends WhatsApp message (with same link)
6. User clicks link → creates account → auto-linked to college

### CSV Format

```csv
email,phone,name,role,enrollment_year
john@example.com,+919876543210,John Doe,student,2022
jane@example.com,+919876543211,Jane Smith,alumni,2018
```

### API Endpoint

```
POST /colleges/:collegeId/onboarding/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: CSV or XLS file
- defaultRole: "student" | "alumni" (optional, defaults to "student")
```

### Response

```json
{
  "success": true,
  "imported": 150,
  "failed": 3,
  "errors": [{ "row": 52, "error": "Invalid email format" }]
}
```

---

## Flow 2: Self-Registration with College Linking

### User Story

> As a **user**, I want to create my profile and add my college, so that I can be linked to my institution.

### Process

1. User signs up on TrueScholar
2. User adds college to their profile
3. System checks if user's email domain matches college's registered domains
   - **Match** → Auto-link user to college
   - **No Match** → Create link request for admin approval

### Email Domain Configuration

Each college can configure allowed email domains:

```
college_info.email_domains = ["@iitd.ac.in", "@iitdelhi.ac.in"]
```

### Link Request API

```
POST /colleges/:collegeId/link-request
Authorization: Bearer <token>
Body: { "role": "student", "enrollmentYear": 2022 }
```

### Admin Approval API

```
GET  /colleges/:collegeId/link-requests              // List pending
POST /colleges/:collegeId/link-requests/:id/approve  // Approve
POST /colleges/:collegeId/link-requests/:id/reject   // Reject
```

---

## Flow 3: Claim Existing Invitation

### User Story

> As a **user** who received an invite, I want to claim it when I sign up, so that I'm linked to my college.

### Process

1. User signs up with email that has a pending invitation
2. System shows pending invitations
3. User accepts invitation
4. User is linked to college with assigned role

### API Endpoint

```
GET  /invitations/pending                // List my pending invites
POST /invitations/:id/accept             // Accept invite
POST /invitations/:id/reject             // Reject invite
```

---

## Database Schema Changes

### invitation table (MODIFY)

| Column      | Type | Description                  |
| ----------- | ---- | ---------------------------- |
| phoneNumber | text | For WhatsApp invites         |
| inviteToken | text | Unique token for invite link |
| source      | text | 'bulk_import' or 'manual'    |

### college_link_request table (NEW)

| Column         | Type        | Description               |
| -------------- | ----------- | ------------------------- |
| id             | text PK     | UUID                      |
| userId         | text FK     | User requesting link      |
| collegeId      | int FK      | Target college            |
| status         | text        | pending/approved/rejected |
| requestedRole  | text        | student/alumni            |
| enrollmentYear | int         | Year of enrollment        |
| createdAt      | timestamptz | Request date              |
| reviewedAt     | timestamptz | Review date               |
| reviewedBy     | text FK     | Admin who reviewed        |

### college_info table (MODIFY)

| Column       | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| emailDomains | text[] | Allowed email domains for auto-linking |

---

## Modules to Create

### 1. CollegeOnboardingModule

```
src/college-onboarding/
├── college-onboarding.module.ts
├── bulk-import/
│   ├── bulk-import.service.ts
│   ├── bulk-import.controller.ts
│   └── dto/
│       └── import-result.dto.ts
├── link-request/
│   ├── link-request.service.ts
│   ├── link-request.controller.ts
│   ├── entities/
│   │   └── college-link-request.entity.ts
│   └── dto/
│       ├── create-link-request.dto.ts
│       └── review-link-request.dto.ts
└── invitation/
    ├── invitation.service.ts
    └── invitation.controller.ts
```

---

## External Integrations

### Email (Existing)

Use existing `sendEmail()` utility with new template:

- Template: `college-invite`
- Variables: `collegeName`, `inviteUrl`, `role`

### WhatsApp (TODO - Commented for now)

Provider TBD. Will add integration later.

```typescript
// TODO: WhatsApp integration
// await sendWhatsAppInvite(phoneNumber, inviteUrl);
```

---

## Configuration

| Setting            | Value                                  |
| ------------------ | -------------------------------------- |
| Max file size      | 10 MB                                  |
| Invite expiration  | 10 days                                |
| Email domain match | Auto-approve (requires verified email) |

---

## Security Considerations

1. **Rate limiting** on bulk import (max 500 per request)
2. **File validation** - only allow CSV/XLS, max 10MB
3. **Email must be verified** before auto-linking
4. **Admin-only** access for bulk import
5. **Invite tokens** are single-use and expire in 10 days

---

## Decisions Made

- [x] WhatsApp provider - **TBD, keep commented**
- [x] Auto-approve with email domain match - **Yes, if email verified**
- [x] Maximum file size - **10 MB**
- [x] Invite expiration - **10 days**
