# App Specification: DAF Charity Impact Report Management

## Purpose
Allow Donor-Advised Funds (DAFs) to manage, review, and approve the impact reports submitted by charities in their network.

---

## Entities

### 1. DAF (Donor-Advised Fund)
- Can view all charities in their network.
- Can view status of each charity's impact report (submitted, due, overdue).
- Can filter charities based on report status.
- Can approve or reject impact reports.
- Can leave comments on rejected reports.

### 2. Impact Report
- Submitted by a charity.
- Becomes **read-only** for both parties once approved.
- Can be downloaded after approval.

---

## Features

### Charity List View
- Display a list of all charities in the network.
- Data to show:
  - Charity Name
  - Impact Report Status
  - Report Deadline
  - Last Updated Date

- Filter Options:
  - All
  - Submitted
  - Due Soon
  - Overdue

### View and Review Impact Report
- Clicking on a submitted report opens the detailed report view.
- Options available:
  - **Approve Report**:
    - Locks the report (read-only).
    - Enables download button for the report.
  - **Reject Report**:
    - Requires DAF to enter rejection comments.
    - Sends the report back to the charity with comments for resubmission.

### Notifications
- Charity receives a notification if their report is:
  - Approved (with link to download).
  - Rejected (with comments attached).
  
---

## Workflows

### 1. Report Submission and Review

```plaintext
Charity submits report → 
DAF views report → 
DAF approves OR rejects with comments → 
If approved → Report locked & downloadable
If rejected → Charity edits and resubmits
