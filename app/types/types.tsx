// Project type
export type Project = {
    id: string;
    name?: string;
    reportStatus?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'not started' | string;
    projectName: string;
    fundingAmount: number;
    dateFundingGiven: Date | null;
    objectives: {
      [key: string]: string;
    };
    lastUpdated?: Date;
    dateImpactReportDue: Date;
    impactReport: Record<string, unknown>;
    impactReportStatus?: 'draft' | 'submitted' | 'approved' | 'rejected' | string;
    rejectionComment?: string;
  };

// ProjectCardProps type
export interface ProjectCardProps {
    project: Project,
    getReportStatusBadge: (status: string | undefined, dueDate: Date) => React.ReactNode;
    getProgressPercentage: (startDate: Date, endDate: Date) => number;
    charityName: string;
    charityRegNumber: string;
  }