"use client";

import type React from "react";
import { format, differenceInDays, differenceInMilliseconds } from "date-fns";
import { Eye, CheckCircle, AlertCircle, XCircle, Clock, FileText, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/app/types/types";

// Props definition for the card
interface CharityReportCardProps {
  charity: Project;
  onViewReport: (charityId: string, reportId: string | undefined) => void;
}

// ... helper functions getDaysRemaining, getProgressPercentage, renderStatusBadge ...
// Helper function to calculate days remaining (copied from page.tsx)
const getDaysRemaining = (deadline: Date | null): number | null => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return differenceInDays(deadlineDate, today);
};

// Helper function to calculate progress percentage (use dateFundingGiven if available)
const getProgressPercentage = (start: Date | null, end: Date | null): number => {
    if (!start || !end || start >= end) return 0;
    const today = new Date();
    if (today <= start) return 0;
    if (today >= end) return 100;
    const totalDuration = differenceInMilliseconds(end, start);
    const elapsedDuration = differenceInMilliseconds(today, start);
    if (totalDuration <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsedDuration / totalDuration) * 100)));
};

// Helper function to render status badges (copied from page.tsx)
const renderStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase(); // For case-insensitive comparison
    switch (lowerStatus) {
        case "submitted":
            return <Badge variant="secondary"><FileText className="mr-1 h-3 w-3" /> Submitted</Badge>;
        case "approved":
            return <Badge className="bg-green-500 text-white"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
        case "draft":
            return <Badge className="bg-blue-500 text-white"><FileText className="mr-1 h-3 w-3" /> Draft</Badge>;
        case "rejected":
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
        case "due soon":
            return <Badge variant="destructive" className="bg-amber-500 text-white"><Clock className="mr-1 h-3 w-3" /> Due Soon</Badge>;
        case "overdue":
            return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Overdue</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export function CharityReportCard({ charity, onViewReport }: CharityReportCardProps) {
    const daysRemaining = getDaysRemaining(charity.dateImpactReportDue);
    // Use dateFundingGiven for progress calculation if available, fallback to lastUpdated
    // Removed unused: const progressStartDate = charity.dateFundingGiven ? new Date(charity.dateFundingGiven) : charity.lastUpdated ? new Date(charity.lastUpdated) : null;
    // Removed unused: const progressPercentage = getProgressPercentage(progressStartDate, charity.dateImpactReportDue);

    // Removed unused: let daysRemainingText = "";
    // if (daysRemaining !== null) {
    //     if (daysRemaining < 0) {
    //         daysRemainingText = `${Math.abs(daysRemaining)} days overdue`;
    //     } else if (daysRemaining === 0) {
    //         daysRemainingText = "Due today";
    //     } else {
    //         daysRemainingText = `${daysRemaining} days remaining`;
    //     }
    // }

    console.log("Charity :", charity);

    return (
        <Card key={charity.id} className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-semibold">{charity.name}</CardTitle>
                        <CardDescription className="mt-1">
                            Funded: ${charity.fundingAmount?.toLocaleString() ?? 'N/A'}
                        </CardDescription>
                    </div>
                    {charity.reportStatus && renderStatusBadge(charity.reportStatus)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {charity.projectName && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Project</h4>
                        <div className="text-sm text-muted-foreground truncate pr-2" title={charity.projectName}>
                            {charity.projectName}
                        </div>
                    </div>
                )}
                {charity.objectives && Object.keys(charity.objectives).length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Objectives</h4>
                        <ul className="space-y-1">
                            {Object.entries(charity.objectives).map(([key, objective]) => (
                                <li key={key} className="text-sm flex items-start">
                                    <span className="mr-2 text-primary">•</span>
                                    {objective}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Funded: {charity.dateFundingGiven ? format(charity.dateFundingGiven, "MMM d, yyyy") : 'N/A'}
                        </span>
                        <span className="flex items-center">
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Report due: {charity.dateImpactReportDue ? format(charity.dateImpactReportDue, "MMM d, yyyy") : 'N/A'}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Project timeline</span>
                            <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {daysRemaining !== null && daysRemaining !== undefined ? daysRemaining : 'N/A'} days remaining
                            </span>
                        </div>
                        <Progress value={getProgressPercentage(charity.dateFundingGiven ? new Date(charity.dateFundingGiven) : null, charity.dateImpactReportDue)} className="h-2" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {(charity.reportStatus?.toLowerCase() === 'not started' ) ? (
                  <Button size="sm" className="w-full" variant="outline" disabled>
                    View Impact Report
                  </Button>
                ) : (
                  <>
                    {charity.reportStatus === 'approved' && charity.id && (
                      <Button
                        size="sm"
                        className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          if (charity.name) {
                            onViewReport(charity.name, charity.id)
                          } else {
                            console.error("Cannot view report: Charity name is missing.");
                          }
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Impact Report
                      </Button>
                    )}
                    {(charity.reportStatus === 'submitted' || charity.reportStatus === 'rejected' || charity.reportStatus === 'draft') && charity.id && (
                      <Button
                        size="sm"
                        className={`w-full flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white ${charity.reportStatus === 'draft' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (charity.reportStatus !== 'draft') {
                            if (charity.name) {
                              onViewReport(charity.name, charity.id)
                            } else {
                              console.error("Cannot view report: Charity name is missing.");
                            }
                          }
                        }}
                        disabled={charity.reportStatus === 'draft'}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review Impact Report
                      </Button>
                    )}
                    {!(charity.reportStatus === 'submitted' || charity.reportStatus === 'rejected' || charity.reportStatus === 'approved' || charity.reportStatus === 'draft') && (
                      <div className="text-sm text-muted-foreground italic h-[36px] flex items-center justify-center w-full">
                        {daysRemaining !== null && daysRemaining < 0 ? (
                          <span className="text-destructive font-medium">Report Overdue</span>
                        ) : (
                          <span></span>
                        )}
                      </div>
                    )}
                  </>
                )}
            </CardFooter>
        </Card>
    );
} 