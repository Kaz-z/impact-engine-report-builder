export interface DAFCharityInfo {
  id: string; // Charity document ID
  name: string;
  projectName?: string;
  reportStatus: 'Submitted' | 'Approved' | 'Rejected' | 'Due Soon' | 'Overdue' | string; // Allow string for flexibility or other statuses
  reportDeadline: Date | null;
  lastUpdated: Date | null;
  projectId?: string; // ID of the latest/relevant impact report
  fundingAmount: number;
  dateFundingGiven: Date | null; // Added funding date
  objectives?: Record<string, string>; // Added objectives
  // Add other relevant fields like contact info, etc.
} 