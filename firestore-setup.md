# Firestore Collection Structure — Pacific Blue Developments
## Phase 1: Leads, Projects, Contacts, StaffMembers

This document defines the exact Firestore collection and field structure for Phase 1
of the Pacific Blue business management application. Use this as the reference when
reviewing data in the Firebase Console or writing security rules and queries.

> **Storage conventions:**
> - All currency values are stored **excluding GST**
> - All dates are stored in **ISO format: YYYY-MM-DD**
> - Every record has `createdAt`, `updatedAt` (Firestore Timestamps), and `createdBy` (Firebase UID string)
> - Dropdown fields use enforced option lists — no free text for classified fields

---

## Collection: `leads`

**Document ID:** Auto-generated Firestore document ID (also stored as `leadId` field)

| Field | Type | Notes / Allowed Values |
|---|---|---|
| `leadId` | string | Mirrors the Firestore document ID |
| `enquiryDate` | string | ISO date: YYYY-MM-DD |
| `fiscalYear` | string | e.g. `"2024-25"` — derived from enquiryDate at write time |
| `reportingPeriod` | string | e.g. `"Q1 2024-25"` — derived from enquiryDate at write time |
| `projectAddress` | string | Full address: Street Number Street Name, Suburb, State, Postcode |
| `projectSuburb` | string | Suburb component of address |
| `projectState` | string | State component of address |
| `leadSource` | string | **Dropdown — enforced values:** `Word of Mouth` / `Website` / `Real Estate Agent` / `Display Home` / `Social Media` / `Referral` / `Other` |
| `formOfContact` | string | **Dropdown — enforced values:** `Phone` / `Email` / `Walk-in` / `Online Form` / `Referral Introduction` |
| `qualifiedStatus` | string | **Dropdown — enforced values:** `Yes` / `No` / `TBD` |
| `qualificationNotes` | string | Free text notes on qualification |
| `estimatedBudget` | number | Dollar value **excluding GST** |
| `projectDescription` | string | Free text description of the project |
| `nonConversionReason` | string | **Dropdown — enforced values:** `Price` / `Went with Competitor` / `Project Cancelled` / `No Response` / `Budget Insufficient` / `Location` / `Other` |
| `openLeadStatus` | boolean | `true` = lead is still open; `false` = lead is closed |
| `assignedSalesPersonId` | string | Firebase UID of the assigned Sales staff member |
| `createdAt` | timestamp | Firestore server timestamp — set on document creation |
| `updatedAt` | timestamp | Firestore server timestamp — updated on every write |
| `createdBy` | string | Firebase UID of the user who created the record |

---

## Collection: `projects`

**Document ID:** Auto-generated Firestore document ID (also stored as `projectId` field)

| Field | Type | Notes / Allowed Values |
|---|---|---|
| `projectId` | string | Mirrors the Firestore document ID |
| `projectCode` | string | Human-readable code, e.g. `PBD-2024-001` |
| `leadId` | string | Reference to the originating lead document ID (nullable) |
| `projectAddress` | string | Full address: Street Number Street Name, Suburb, State, Postcode |
| `projectSuburb` | string | Suburb component |
| `projectState` | string | State component |
| `projectType` | string | **Dropdown — enforced values:** `New Build` / `KDRB` / `Duplex` / `Granny Flat` / `Renovation` / `Commercial` / `Extension` |
| `projectPhase` | string | **Dropdown — enforced values:** `Sales` / `Preliminaries` / `Construction` / `Completed` / `On Hold` / `Cancelled` |
| `likelihoodPct` | number | Decimal between 0 and 1, e.g. `0.75` for 75% |
| `likelihoodLevel` | string | **Dropdown — enforced values:** `High` / `Medium` / `Low` |
| `expectedCommencementMonth` | string | ISO date for first day of expected month: YYYY-MM-01 |
| `supervisorId` | string | Firebase UID of assigned Supervisor |
| `salesPersonId` | string | Firebase UID of assigned Sales person |
| `contractValueGST` | number | Contract value **including GST** — stored as-is for display; all reporting uses ex-GST (divide by 1.1) |
| `currentStage` | string | **Dropdown — enforced values:** `Consult` / `Concept` / `Proposal` / `Prelim` / `Contract` / `Commence` / `Base` / `Frame` / `Enclosed` / `Fixing` / `PC` |
| `nextStage` | string | Same dropdown values as `currentStage` |
| `nextStageDate` | string | ISO date: YYYY-MM-DD |
| `pipelineNotes` | string | Free text notes on pipeline status |
| `createdAt` | timestamp | Firestore server timestamp — set on document creation |
| `updatedAt` | timestamp | Firestore server timestamp — updated on every write |
| `createdBy` | string | Firebase UID of the user who created the record |

---

## Collection: `contacts`

**Document ID:** Auto-generated Firestore document ID (also stored as `contactId` field)

| Field | Type | Notes / Allowed Values |
|---|---|---|
| `contactId` | string | Mirrors the Firestore document ID |
| `firstName` | string | Contact's first name |
| `lastName` | string | Contact's last name |
| `email` | string | Email address |
| `phone` | string | Phone number (stored as string to preserve formatting) |
| `contactType` | string | **Dropdown — enforced values:** `Client` / `Referrer-Client` / `Referrer-Professional` / `Architect` / `Engineer` / `Agent` / `Other` |
| `companyName` | string | Company or organisation name (optional) |
| `isMailchimpSubscriber` | boolean | `true` = subscribed to Mailchimp list |
| `googleReviewSubmitted` | boolean | `true` = has submitted a Google review |
| `createdAt` | timestamp | Firestore server timestamp — set on document creation |
| `updatedAt` | timestamp | Firestore server timestamp — updated on every write |
| `createdBy` | string | Firebase UID of the user who created the record |

---

## Collection: `staffmembers`

**Document ID:** Auto-generated Firestore document ID (also stored as `staffId` field)

| Field | Type | Notes / Allowed Values |
|---|---|---|
| `staffId` | string | Mirrors the Firestore document ID |
| `firstName` | string | Staff member's first name |
| `lastName` | string | Staff member's last name |
| `role` | string | **Dropdown — enforced values:** `Director` / `Sales` / `Supervisor` / `Contract Admin` / `Accounts` / `Administration` |
| `email` | string | Staff member's email address (should match Firebase Auth email) |
| `phone` | string | Phone number (stored as string) |
| `startDate` | string | ISO date: YYYY-MM-DD |
| `isActive` | boolean | `true` = currently employed |
| `createdAt` | timestamp | Firestore server timestamp — set on document creation |
| `updatedAt` | timestamp | Firestore server timestamp — updated on every write |
| `createdBy` | string | Firebase UID of the user who created the record |

---

## Index Recommendations

Create the following composite indexes in the Firebase Console
(Firestore → Indexes → Composite):

| Collection | Fields | Order | Purpose |
|---|---|---|---|
| `leads` | `openLeadStatus`, `enquiryDate` | ASC, DESC | Open leads list sorted by date |
| `leads` | `assignedSalesPersonId`, `openLeadStatus` | ASC, ASC | Leads by salesperson |
| `leads` | `fiscalYear`, `leadSource` | ASC, ASC | Reporting by source |
| `projects` | `projectPhase`, `createdAt` | ASC, DESC | Projects by phase |
| `projects` | `supervisorId`, `projectPhase` | ASC, ASC | Supervisor's active projects |
| `projects` | `salesPersonId`, `projectPhase` | ASC, ASC | Salesperson's projects |

---

## Notes

- **No subcollections** are used in Phase 1. All entities are top-level collections.
- **References between documents** use string ID fields (e.g. `leadId` in `projects`),
  not Firestore DocumentReference types, to simplify client-side querying.
- **Phase 2 collections** (`claims`, `variations`, `costs`, `marketingactivities`) are
  not created in Phase 1 — add them when required.
