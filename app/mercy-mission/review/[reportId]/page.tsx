"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Info, Users, Target, Mail, Phone, Calendar, DollarSign, Globe, FileText, Image as ImageIcon, ArrowLeft, Link2, Download } from 'lucide-react';
import { useLoading } from '@/app/context/loadingContext';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { doc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Loading } from '@/app/components/Loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReactToPrint } from 'react-to-print';

// Define new interface based on provided structure
type ReportStatus = "Submitted" | "Approved" | "Rejected" | string;

interface RejectionModalContentProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialComment: string;
    onConfirmReject: (comment: string) => void;
    onDebouncedCommentChange: (comment: string) => void;
}

const RejectionModalContent = memo(({
    isOpen,
    onOpenChange,
    initialComment,
    onConfirmReject,
    onDebouncedCommentChange
}: RejectionModalContentProps) => {
    const [inputValue, setInputValue] = useState(initialComment);

    // Effect to update internal input value if initialComment changes (e.g. dialog reopened)
    useEffect(() => {
        setInputValue(initialComment);
    }, [initialComment, isOpen]); // Rerun if isOpen changes to reset when dialog opens

    // Debounce effect for updating parent's rejectionComment
    useEffect(() => {
        const handler = setTimeout(() => {
            onDebouncedCommentChange(inputValue);
        }, 300); // Adjust delay as needed

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, onDebouncedCommentChange]);

    const handleInternalConfirm = () => {
        if (inputValue.trim()) {
            onConfirmReject(inputValue);
        }
    };

    if (!isOpen) return null; // Render nothing if not open, Dialog controls visibility

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Reject Report</DialogTitle>
                <DialogDescription>
                    Please provide a reason for rejecting this report. This comment will be visible to the charity.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea
                    placeholder="Enter rejection reason..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleInternalConfirm} disabled={!inputValue.trim()}>Confirm Rejection</Button>
            </DialogFooter>
        </DialogContent>
    );
});
RejectionModalContent.displayName = 'RejectionModalContent';

interface GeographyBreakdown {
    country: string;
    region?: string;
    city: string;
    directBeneficiaries: number;
    indirectBeneficiaries: number;
}

interface OutcomeImage {
    url: string;
    fileName?: string;
    uploadedAt?: string;
}

interface ImpactReportViewData {
    id: string;
    charityId: string;
    projectName: string;
    status: ReportStatus;
    organizationName: string;
    charityRegistrationNumber?: string;
    totalFundingAmount?: number;
    partnershipInvolvement?: number;
    telephone?: string;
    projectCountry?: string[];
    hasPartners?: boolean;
    partnerOrganizations?: string;
    partnerContract?: {
        fileName: string;
        uploadedAt: string;
        url: string;
    }
    priorityObjective?: string;
    coverageObjective?: string;
    projectSummary?: string;
    contactName?: string;
    position?: string;
    email?: string;
    dateFundingStarted?: string;
    dateImpactReportSubmitted?: string;
    outcome1Qualitative?: string;
    outcome1Quantitative?: string;
    outcome1Achieved?: string;
    outcome1FundingPlanned?: number;
    outcome1FundingSpent?: number;
    outcome1DifferenceReason?: string;
    outcome1SurplusPlans?: string;
    outcome1AmountLeftOver?: number;
    outcome1Story?: string;
    outcome1Images?: OutcomeImage[];
    outcome1Interviews?: string;
    outcome1SocialMedia?: string;
    includeOutcome2?: boolean;
    outcome2Qualitative?: string;
    outcome2Quantitative?: string;
    includeAchievedOutcome2?: boolean;
    outcome2Achieved?: string;
    outcome2FundingPlanned?: number;
    outcome2FundingSpent?: number;
    outcome2DifferenceReason?: string;
    outcome2SurplusPlans?: string;
    outcome2AmountLeftOver?: number;
    outcome2Story?: string;
    outcome2Images?: OutcomeImage[];
    outcome2Interviews?: string;
    outcome2SocialMedia?: string;
    includeOutcome3?: boolean;
    outcome3Qualitative?: string;
    outcome3Quantitative?: string;
    includeAchievedOutcome3?: boolean;
    outcome3Achieved?: string;
    outcome3FundingPlanned?: number;
    outcome3FundingSpent?: number;
    outcome3DifferenceReason?: string;
    outcome3SurplusPlans?: string;
    outcome3AmountLeftOver?: number;
    outcome3Story?: string;
    outcome3Images?: OutcomeImage[];
    outcome3Interviews?: string;
    outcome3SocialMedia?: string;
    directBeneficiaries?: number;
    indirectBeneficiaries?: number;
    maleBeneficiaries?: number;
    femaleBeneficiaries?: number;
    maleIndirectBeneficiaries?: number;
    femaleIndirectBeneficiaries?: number;
    under18Beneficiaries?: number;
    age18to34Beneficiaries?: number;
    age35to54Beneficiaries?: number;
    over55Beneficiaries?: number;
    under18IndirectBeneficiaries?: number;
    age18to34IndirectBeneficiaries?: number;
    age35to54IndirectBeneficiaries?: number;
    over55IndirectBeneficiaries?: number;
    geographyBreakdown?: GeographyBreakdown[];
    detailedEthnicities?: string[];
    rejectionComment?: string;
}

// Helper to format date string
const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
        if (typeof dateString === 'string') {
            return format(parseISO(dateString), 'PPP');
        } else {
            return format(dateString, 'PPP');
        }
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return "Invalid Date";
    }
};

// Helper to format currency
const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
};

// ForwardRef for the new PrintableReport component
const PrintableReport = React.forwardRef<HTMLDivElement, { report: ImpactReportViewData }>(({ report }, ref) => {
    if (!report) return null;

    // Basic styling for print - can be expanded
    const printStyles: React.CSSProperties = {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#000000', // Ensure text is black for printing
    };

    return (
        <div ref={ref} style={printStyles}>
            <h1>Impact Report: {report.projectName}</h1>
            <h2>Organization: {report.organizationName}</h2>
            <p><strong>Status:</strong> {report.status}</p>
            <hr style={{ margin: '20px 0' }} />

            <h3>Project Information</h3>
            <p><strong>Summary:</strong> {report.projectSummary || 'N/A'}</p>
            <p><strong>Total Funding:</strong> {formatCurrency(report.totalFundingAmount)}</p>
            <p><strong>Country:</strong> {report.projectCountry?.join(', ') || 'N/A'}</p>
            <p><strong>Funding Start:</strong> {formatDate(report.dateFundingStarted)}</p>
            <p><strong>Report Submitted:</strong> {formatDate(report.dateImpactReportSubmitted)}</p>
            
            {/* Add more sections and fields as needed for a basic print output */}
            {/* For example, Outcome 1 details */}
            {report.outcome1Qualitative && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <h3>Outcome 1</h3>
                    <p><strong>Expected Qualitative:</strong> {report.outcome1Qualitative}</p>
                    <p><strong>Expected Quantitative:</strong> {report.outcome1Quantitative || 'N/A'}</p>
                    {report.outcome1Achieved && <p><strong>Achieved:</strong> {report.outcome1Achieved}</p>}
                </>
            )}

            {/* Consider adding a small note that this is a simplified printable view */}
            <hr style={{ margin: '20px 0' }} />
            <p style={{ fontSize: '0.8em', textAlign: 'center', color: '#555555' }}>
                Generated for printing from Impact Engine
            </p>
        </div>
    );
});
PrintableReport.displayName = 'PrintableReport';

// Component to display report details
export default function ReviewReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramsFromHook = useParams<{ reportId: string }>();
    const { startLoading, stopLoading } = useLoading();
    const [report, setReport] = useState<ImpactReportViewData | null>(null);
    const [localLoading, setLocalLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rejectionComment, setRejectionComment] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [displayedRejectionComment, setDisplayedRejectionComment] = useState<string | null>(null);

    const reportContentRef = useRef<HTMLDivElement | null>(null);
    const printableContentRef = useRef<HTMLDivElement | null>(null); // New ref for the hidden printable component

    // Get reportId from the hook's result, providing a fallback or handling potential null
    const reportId = paramsFromHook ? paramsFromHook.reportId : null;
    const charityId = searchParams ? searchParams.get('charityId') : null;

    useEffect(() => {
        const fetchReportData = async () => {
            if (!reportId || !charityId) {
                console.error("Missing reportId or charityId");
                setError("Required information (report or charity ID) is missing.");
                setLocalLoading(false);
                stopLoading();
                return;
            }

            console.log(`Fetching report ${reportId} for charity ${charityId}...`);
            setLocalLoading(true);
            setError(null);
            startLoading();

            try {
                const projectDocRef = doc(db, "charities", charityId, "projects", reportId);
                const docSnap = await getDoc(projectDocRef);

                if (docSnap.exists()) {
                    const projectData = docSnap.data();
                    const impactReportData = projectData.impactReport || {};

                    console.log("Fetched Project Data:", projectData);
                    console.log("Nested Impact Report Data:", impactReportData);

                    const combinedData: ImpactReportViewData = {
                        id: reportId,
                        charityId: charityId,
                        projectName: projectData.projectName || "N/A",
                        status: projectData.impactReportStatus || "Unknown",
                        organizationName: charityId,
                        totalFundingAmount: impactReportData.totalFundingAmount,
                        partnershipInvolvement: impactReportData.partnershipInvolvement,
                        telephone: impactReportData.telephone,
                        projectCountry: impactReportData.projectCountry,
                        hasPartners: impactReportData.hasPartners,
                        priorityObjective: impactReportData.priorityObjective,
                        coverageObjective: impactReportData.coverageObjective,
                        projectSummary: impactReportData.projectSummary,
                        contactName: impactReportData.contactName,
                        position: impactReportData.position,
                        email: impactReportData.email,
                        dateFundingStarted: impactReportData.dateFundingStarted instanceof Timestamp
                            ? impactReportData.dateFundingStarted.toDate().toISOString()
                            : impactReportData.dateFundingStarted,
                        dateImpactReportSubmitted: impactReportData.dateImpactReportSubmitted instanceof Timestamp
                            ? impactReportData.dateImpactReportSubmitted.toDate().toISOString()
                            : impactReportData.dateImpactReportSubmitted,
                        outcome1Qualitative: impactReportData.outcome1Qualitative,
                        outcome1Quantitative: impactReportData.outcome1Quantitative,
                        outcome1Achieved: impactReportData.outcome1Achieved,
                        outcome1FundingPlanned: impactReportData.outcome1FundingPlanned,
                        outcome1FundingSpent: impactReportData.outcome1FundingSpent,
                        outcome1DifferenceReason: impactReportData.outcome1DifferenceReason,
                        outcome1SurplusPlans: impactReportData.outcome1SurplusPlans,
                        outcome1AmountLeftOver: impactReportData.outcome1AmountLeftOver,
                        outcome1Story: impactReportData.outcome1Story,
                        outcome1Images: Array.isArray(impactReportData.outcome1Images) ? impactReportData.outcome1Images : [],
                        outcome1Interviews: impactReportData.outcome1Interviews,
                        outcome1SocialMedia: impactReportData.outcome1SocialMedia,
                        includeOutcome2: impactReportData.includeOutcome2,
                        outcome2Qualitative: impactReportData.outcome2Qualitative,
                        outcome2Quantitative: impactReportData.outcome2Quantitative,
                        includeAchievedOutcome2: impactReportData.includeAchievedOutcome2,
                        outcome2Achieved: impactReportData.outcome2Achieved,
                        outcome2FundingPlanned: impactReportData.outcome2FundingPlanned,
                        outcome2FundingSpent: impactReportData.outcome2FundingSpent,
                        outcome2DifferenceReason: impactReportData.outcome2DifferenceReason,
                        outcome2SurplusPlans: impactReportData.outcome2SurplusPlans,
                        outcome2AmountLeftOver: impactReportData.outcome2AmountLeftOver,
                        outcome2Story: impactReportData.outcome2Story,
                        outcome2Images: Array.isArray(impactReportData.outcome2Images) ? impactReportData.outcome2Images : [],
                        outcome2Interviews: impactReportData.outcome2Interviews,
                        outcome2SocialMedia: impactReportData.outcome2SocialMedia,
                        includeOutcome3: impactReportData.includeOutcome3,
                        outcome3Qualitative: impactReportData.outcome3Qualitative,
                        outcome3Quantitative: impactReportData.outcome3Quantitative,
                        includeAchievedOutcome3: impactReportData.includeAchievedOutcome3,
                        outcome3Achieved: impactReportData.outcome3Achieved,
                        outcome3FundingPlanned: impactReportData.outcome3FundingPlanned,
                        outcome3FundingSpent: impactReportData.outcome3FundingSpent,
                        outcome3DifferenceReason: impactReportData.outcome3DifferenceReason,
                        outcome3SurplusPlans: impactReportData.outcome3SurplusPlans,
                        outcome3AmountLeftOver: impactReportData.outcome3AmountLeftOver,
                        outcome3Story: impactReportData.outcome3Story,
                        outcome3Images: Array.isArray(impactReportData.outcome3Images) ? impactReportData.outcome3Images : [],
                        outcome3Interviews: impactReportData.outcome3Interviews,
                        outcome3SocialMedia: impactReportData.outcome3SocialMedia,
                        directBeneficiaries: impactReportData.directBeneficiaries,
                        indirectBeneficiaries: impactReportData.indirectBeneficiaries,
                        maleBeneficiaries: impactReportData.maleBeneficiaries,
                        femaleBeneficiaries: impactReportData.femaleBeneficiaries,
                        maleIndirectBeneficiaries: impactReportData.maleIndirectBeneficiaries,
                        femaleIndirectBeneficiaries: impactReportData.femaleIndirectBeneficiaries,
                        under18Beneficiaries: impactReportData.under18Beneficiaries,
                        age18to34Beneficiaries: impactReportData.age18to34Beneficiaries,
                        age35to54Beneficiaries: impactReportData.age35to54Beneficiaries,
                        over55Beneficiaries: impactReportData.over55Beneficiaries,
                        under18IndirectBeneficiaries: impactReportData.under18IndirectBeneficiaries,
                        age18to34IndirectBeneficiaries: impactReportData.age18to34IndirectBeneficiaries,
                        age35to54IndirectBeneficiaries: impactReportData.age35to54IndirectBeneficiaries,
                        over55IndirectBeneficiaries: impactReportData.over55IndirectBeneficiaries,
                        geographyBreakdown: Array.isArray(impactReportData.geographyBreakdown) ? impactReportData.geographyBreakdown : [],
                        detailedEthnicities: Array.isArray(impactReportData.detailedEthnicities) ? impactReportData.detailedEthnicities : [],
                        rejectionComment: projectData.rejectionComment || '',
                        partnerOrganizations: impactReportData.partnerOrganizations || '',
                        partnerContract: impactReportData.partnerContract || {
                            fileName: impactReportData.partnerContract?.fileName || '',
                            uploadedAt: impactReportData.partnerContract?.uploadedAt || '',
                            url: impactReportData.partnerContract?.url || '',
                        },
                    };

                    console.log("Combined Report Data for View:", combinedData);
                    setReport(combinedData);

                    // Set displayedRejectionComment after fetching and setting report
                    if (combinedData.status === 'rejected' && combinedData.rejectionComment) {
                        setDisplayedRejectionComment(combinedData.rejectionComment);
                        setRejectionComment(combinedData.rejectionComment); // Pre-fill modal if re-opened
                    } else {
                        setDisplayedRejectionComment(null); // Clear if not rejected or no comment
                    }

                } else {
                    console.error(`Report document not found at charities/${charityId}/projects/${reportId}`);
                    setError("Impact report data could not be found.");
                    setReport(null);
                }
            } catch (err) {
                console.error("Error fetching report data from Firestore:", err);
                setError("Failed to load report data. Please try again later.");
                setReport(null);
            } finally {
                await new Promise(resolve => setTimeout(resolve, 300));
                setLocalLoading(false);
                stopLoading();
            }
        };

        fetchReportData();

    }, [reportId, charityId, startLoading, stopLoading]);

    // Add this useEffect for debugging reportContentRef
    useEffect(() => {
        if (report && !localLoading && !error) {
            const timerId = setTimeout(() => {
                console.log('[DEBUG] reportContentRef.current (in useEffect after report render):', reportContentRef.current);
                // console.log('[DEBUG] printableContentRef.current (in useEffect after report render):', printableContentRef.current);
            }, 0);
            return () => clearTimeout(timerId);
        } else if (reportContentRef.current) { // Check reportContentRef
            // Log if the ref exists but the other conditions aren't met (e.g., during an update)
             console.log('[DEBUG] reportContentRef.current (UI not fully ready or ref present during update):', reportContentRef.current);
        } else {
            console.log('[DEBUG] reportContentRef.current (UI not ready or ref is null):', reportContentRef.current);
        }
    }, [report, localLoading, error]);

    const updateReportStatus = useCallback(async (newStatus: ReportStatus, comment?: string) => {
        if (!report || !report.charityId || !report.id) {
            console.error("Cannot update status: Missing report context.");
            return;
        }

        startLoading();
        console.log(`Updating report ${report.id} status to ${newStatus}...`);

        const projectDocRef = doc(db, "charities", report.charityId, "projects", report.id);

        try {
            const updateData: { impactReportStatus: ReportStatus; lastUpdated: unknown; rejectionComment?: string } = {
                impactReportStatus: newStatus,
                lastUpdated: serverTimestamp(),
            };
            if (newStatus === 'rejected' && comment) {
                updateData.rejectionComment = comment;
            }

            await updateDoc(projectDocRef, updateData);

            setReport(prev => prev ? { ...prev, status: newStatus } : null);
            console.log(`Report ${report.id} status updated successfully to ${newStatus}.`);

            if (newStatus === 'rejected') {
                setIsRejectDialogOpen(false);
                setRejectionComment(''); // Clear parent's comment
            }

        } catch (error) {
            console.error("Failed to update report status:", error);
        } finally {
            stopLoading();
        }
    }, [report, startLoading, stopLoading]);

    const confirmApprove = useCallback(() => {
        updateReportStatus('approved');
        setIsApproveDialogOpen(false);
    }, [updateReportStatus]);

    const handleActualReject = useCallback((commentFromModal: string) => {
        if (!commentFromModal.trim()) {
            console.error("Rejection comment cannot be empty.");
            return;
        }
        updateReportStatus('rejected', commentFromModal);
    }, [updateReportStatus]);

    // Callback for the debounced comment from the modal
    const handleDebouncedCommentChange = useCallback((comment: string) => {
        setRejectionComment(comment);
    }, []);

    // Restore useReactToPrint to the top level
    const reactToPrintTrigger = useReactToPrint({
        contentRef: reportContentRef,
        documentTitle: report ? `${report.projectName} - Impact Report` : 'Impact Report',
        onPrintError: (errorLocation: string, error: Error) => {
            console.error(`Error printing from react-to-print (location: ${errorLocation}):`, error);
            console.log('[DEBUG] reportContentRef.current (at onPrintError):', reportContentRef.current);
        },
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 20mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .report-card-for-print { /* Add this class to your main Card component */
                    page-break-inside: avoid !important;
                }
                .outcome-section-for-print { /* Add this class to OutcomeSection wrappers */
                    page-break-inside: avoid !important;
                    margin-top: 15px;
                    padding-top: 10px;
                }
                img {
                    max-width: 100% !important;
                    height: auto !important;
                    display: block; /* Helps with spacing around images */
                }
                .no-print {
                    display: none !important;
                }
            }
        `,
        // html2canvas options removed for now, pending investigation of UseReactToPrintOptions type
    });

    const handlePrint = () => {
        console.log('[DEBUG] reportContentRef.current (just before calling reactToPrintTrigger):', reportContentRef.current);
        if (!reportContentRef.current) {
            alert("Debug: The main report content (reportContentRef) is not available. Please ensure the report is fully loaded and the ref is attached.");
            return;
        }
        // Call the memoized trigger
        if (reactToPrintTrigger) {
            reactToPrintTrigger();
        } else {
            console.error("[DEBUG] reactToPrintTrigger is not available.");
            alert("Debug: Failed to get a print trigger. Please check the console.");
        }
    };

    if (localLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center">
                    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl p-6 text-center">
                        <CardHeader>
                            <CardTitle className="text-red-600">Error Loading Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">{error}</p>
                        </CardContent>
                         <CardFooter className="flex justify-center mt-4">
                             <Button variant="outline" onClick={() => router.push('/mercy-mission')}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
                            </Button>
                         </CardFooter>
                    </Card>
                </main>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center">
                    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl p-6 text-center">
                        <CardHeader>
                            <CardTitle>Report Not Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">The requested impact report could not be found.</p>
                        </CardContent>
                         <CardFooter className="flex justify-center mt-4">
                             <Button variant="outline" onClick={() => router.push('/mercy-mission')}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
                            </Button>
                         </CardFooter>
                    </Card>
                </main>
            </div>
        );
    }

    const OutcomeSection = ({ outcomeNumber, report }: { outcomeNumber: 1 | 2 | 3; report: ImpactReportViewData }) => {
        if (!report) return null;

        const includeKey = `includeOutcome${outcomeNumber}` as keyof ImpactReportViewData;
        const includeAchievedKey = `includeAchievedOutcome${outcomeNumber}` as keyof ImpactReportViewData;
        const qualitativeKey = `outcome${outcomeNumber}Qualitative` as keyof ImpactReportViewData;
        const quantitativeKey = `outcome${outcomeNumber}Quantitative` as keyof ImpactReportViewData;
        const achievedKey = `outcome${outcomeNumber}Achieved` as keyof ImpactReportViewData;
        const fundingPlannedKey = `outcome${outcomeNumber}FundingPlanned` as keyof ImpactReportViewData;
        const fundingSpentKey = `outcome${outcomeNumber}FundingSpent` as keyof ImpactReportViewData;
        const differenceReasonKey = `outcome${outcomeNumber}DifferenceReason` as keyof ImpactReportViewData;
        const surplusPlansKey = `outcome${outcomeNumber}SurplusPlans` as keyof ImpactReportViewData;
        const amountLeftOverKey = `outcome${outcomeNumber}AmountLeftOver` as keyof ImpactReportViewData;
        const storyKey = `outcome${outcomeNumber}Story` as keyof ImpactReportViewData;
        const imagesKey = `outcome${outcomeNumber}Images` as keyof ImpactReportViewData;
        const interviewsKey = `outcome${outcomeNumber}Interviews` as keyof ImpactReportViewData;
        const socialMediaKey = `outcome${outcomeNumber}SocialMedia` as keyof ImpactReportViewData;

        const included = outcomeNumber === 1 ? true : !!report[includeKey];
        const achievedIncluded = outcomeNumber === 1 ? true : !!report[includeAchievedKey];

        if (!included) return null;

        const qualitative = (report[qualitativeKey] as string) || 'N/A';
        const quantitative = (report[quantitativeKey] as string) || 'N/A';
        const achieved = achievedIncluded ? ((report[achievedKey] as string) || 'N/A') : 'N/A';
        const fundingPlanned = achievedIncluded ? (report[fundingPlannedKey] as number | undefined) : undefined;
        const fundingSpent = achievedIncluded ? (report[fundingSpentKey] as number | undefined) : undefined;
        const differenceReason = achievedIncluded ? ((report[differenceReasonKey] as string) || '') : '';
        const surplusPlans = achievedIncluded ? ((report[surplusPlansKey] as string) || '') : '';
        const amountLeftOver = achievedIncluded ? (report[amountLeftOverKey] as number | undefined) : undefined;
        const story = (report[storyKey] as string) || '';
        const images = (report[imagesKey] as OutcomeImage[]) || [];
        const interviews = (report[interviewsKey] as string) || '';
        const socialMedia = (report[socialMediaKey] as string) || '';

        const fundingDifference = (fundingPlanned !== undefined && fundingSpent !== undefined) ? fundingPlanned - fundingSpent : null;

        return (
             <div className="outcome-section-for-print space-y-5 pt-6 border-t border-gray-200 first:pt-0 first:border-t-0">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Outcome {outcomeNumber}</h3>

                <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <h4 className="text-md font-semibold mb-2 text-gray-700">Expected Outcome</h4>
                    <p className="leading-relaxed"><strong className="text-gray-600">Qualitative:</strong> {qualitative}</p>
                    <p className="leading-relaxed"><strong className="text-gray-600">Quantitative:</strong> {quantitative}</p>
                </div>

                {achievedIncluded && (
                    <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4">
                        <h4 className="text-md font-semibold mb-2 text-gray-700">Achieved Outcome</h4>
                        <p className="leading-relaxed"><strong className="text-gray-600">What was achieved:</strong> {achieved}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div>
                                <p><strong className="text-gray-600">Funding Planned:</strong> {formatCurrency(fundingPlanned)}</p>
                                <p><strong className="text-gray-600">Funding Spent:</strong> {formatCurrency(fundingSpent)}</p>
                            </div>
                            {fundingDifference !== null && (
                                <div>
                                    <p><strong className="text-gray-600">Difference:</strong> <span className={fundingDifference < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{formatCurrency(fundingDifference)} {fundingDifference < 0 ? '(Overspent)' : '(Underspent)'}</span></p>
                                    {differenceReason && <p className="mt-1 text-gray-600"><strong className="text-gray-700">Reason:</strong> {differenceReason}</p>}
                                    {fundingDifference > 0 && surplusPlans && <p className="mt-1 text-gray-600"><strong className="text-gray-700">Surplus Plans:</strong> {surplusPlans}</p>}
                                    {fundingDifference > 0 && amountLeftOver !== undefined && <p className="mt-1"><strong className="text-gray-600">Amount Left:</strong> {formatCurrency(amountLeftOver)}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(story || images.length > 0 || interviews || socialMedia) && (
                    <div className="pt-4 space-y-4">
                        <h4 className="text-md font-semibold text-gray-700">Supporting Materials</h4>
                        {story && (
                            <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 flex items-center"><Info className="mr-2 h-4 w-4 text-gray-500"/>Impact Story</h5>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{story}</p>
                            </div>
                        )}
                        {images.length > 0 && (
                            <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-3 flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-gray-500"/>Uploaded Images</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {images.map((image, index) => (
                                        <a key={index} href={image.url} target="_blank" rel="noopener noreferrer" className="group relative block h-56 overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                                            {image.url ? (
                                                <Image
                                                    src={image.url}
                                                    alt={`Outcome ${outcomeNumber} Image ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 50vw"
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105 no-print-image-source-change"
                                                    onError={(e) => console.error(`Error loading image ${index}:`, e)}
                                                    unoptimized={true}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">Image not available</div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {interviews && (
                            <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 flex items-center"><FileText className="mr-2 h-4 w-4 text-gray-500"/>Interviews/Testimonials</h5>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{interviews}</p>
                            </div>
                        )}
                        {socialMedia && (
                            <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 flex items-center"><Globe className="mr-2 h-4 w-4 text-gray-500"/>Social Media/External Links</h5>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {socialMedia.split(/(\\s+)/).map((part, i) => {
                                        if (part.startsWith('http://') || part.startsWith('https://')) {
                                            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{part}</a>;
                                        }
                                        return <span key={i}>{part}</span>;
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8">
                 <Card ref={reportContentRef} className="report-card-for-print w-full max-w-4xl mx-auto shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b-2 border-gray-200 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                            <div>
                                <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">{report.projectName} - Impact Report</CardTitle>
                                <CardDescription className="mt-2 text-gray-500">{report.organizationName} {report.charityRegistrationNumber ? `(Reg: ${report.charityRegistrationNumber})` : ''}</CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className={`mt-3 sm:mt-0 px-4 py-1.5 rounded-full text-xs font-semibold border ${report.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                        report.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                        report.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}
                            >
                                {report.status}
                            </Badge>
                        </div>
                        {/* Alert for Rejection Comment - Placed inside CardHeader, below title/badge */}
                        {report.status === 'rejected' && displayedRejectionComment && (
                            <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 text-red-700 rounded-md">
                                <Info className="h-5 w-5" />
                                <AlertTitle className="font-semibold">Rejection Reason</AlertTitle>
                                <AlertDescription className="whitespace-pre-line">
                                    {displayedRejectionComment}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 space-y-8 bg-white">
                         <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div className="flex items-start space-x-3">
                                    <FileText className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                    <span className="leading-relaxed"><strong className="text-gray-700 font-medium">Summary:</strong> {report.projectSummary || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Total Funding:</strong> {formatCurrency(report.totalFundingAmount)}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Globe className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Country:</strong> {report.projectCountry?.join(', ') || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Funding Start:</strong> {formatDate(report.dateFundingStarted)}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Report Submitted:</strong> {formatDate(report.dateImpactReportSubmitted)}</span>
                                </div>
                                {report.priorityObjective && <div className="flex items-center space-x-3"><Target className="h-4 w-4 text-gray-500 shrink-0"/><span><strong className="text-gray-700 font-medium">Priority Objective:</strong> {report.priorityObjective}</span></div>}
                                {report.coverageObjective && <div className="flex items-center space-x-3"><Users className="h-4 w-4 text-gray-500 shrink-0"/><span><strong className="text-gray-700 font-medium">Coverage Objective:</strong> {report.coverageObjective}</span></div>}
                            </div>

                             <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 pt-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Name:</strong> {report.contactName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Info className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Position:</strong> {report.position || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Email:</strong> {report.email ? <a href={`mailto:${report.email}`} className="text-blue-600 hover:underline">{report.email}</a> : 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                                    <span><strong className="text-gray-700 font-medium">Telephone:</strong> {report.telephone || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Partnership Information Section */}
                            {report.hasPartners && (
                                <div className="space-y-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Partnership Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                        {report.partnerOrganizations && (
                                            <div className="flex items-start space-x-3">
                                                <Users className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                                <span className="leading-relaxed"><strong className="text-gray-700 font-medium">Partner Organizations:</strong> {report.partnerOrganizations}</span>
                                            </div>
                                        )}
                                        {report.partnerContract && report.partnerContract.url && (
                                            <div className="flex items-center space-x-3">
                                                <Link2 className="h-4 w-4 text-gray-500 shrink-0" />
                                                <span>
                                                    <strong className="text-gray-700 font-medium">Partner Contract:</strong>
                                                    <a
                                                        href={report.partnerContract.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline ml-1 break-all"
                                                    >
                                                        {report.partnerContract.fileName || "View Contract"}
                                                    </a>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <OutcomeSection outcomeNumber={1} report={report} />
                        <OutcomeSection outcomeNumber={2} report={report} />
                        <OutcomeSection outcomeNumber={3} report={report} />

                        <div className="space-y-6 pt-6 border-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center"><Users className="mr-2 h-5 w-5 text-gray-500" />Beneficiary Demographics</h3>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 space-y-3 shadow-sm">
                                    <h4 className="text-md font-semibold text-gray-700">Direct Beneficiaries ({report.directBeneficiaries ?? 0})</h4>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Male:</strong> {report.maleBeneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Female:</strong> {report.femaleBeneficiaries ?? 0}</p>
                                    <h5 className="text-sm font-semibold text-gray-700 pt-2">Age Breakdown:</h5>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Under 18:</strong> {report.under18Beneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">18-34:</strong> {report.age18to34Beneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">35-54:</strong> {report.age35to54Beneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Over 55:</strong> {report.over55Beneficiaries ?? 0}</p>
                                </div>

                                <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 space-y-3 shadow-sm">
                                    <h4 className="text-md font-semibold text-gray-700">Indirect Beneficiaries ({report.indirectBeneficiaries ?? 0})</h4>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Male:</strong> {report.maleIndirectBeneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Female:</strong> {report.femaleIndirectBeneficiaries ?? 0}</p>
                                    <h5 className="text-sm font-semibold text-gray-700 pt-2">Age Breakdown:</h5>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Under 18:</strong> {report.under18IndirectBeneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">18-34:</strong> {report.age18to34IndirectBeneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">35-54:</strong> {report.age35to54IndirectBeneficiaries ?? 0}</p>
                                    <p className="text-sm"><strong className="text-gray-600 font-medium">Over 55:</strong> {report.over55IndirectBeneficiaries ?? 0}</p>
                                </div>
                            </div>

                            {report.geographyBreakdown && report.geographyBreakdown.length > 0 && (
                                <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">Geography Breakdown</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left px-4 py-2 font-semibold text-gray-600 tracking-wider">Country</th>
                                                    <th className="text-left px-4 py-2 font-semibold text-gray-600 tracking-wider">Region</th>
                                                    <th className="text-left px-4 py-2 font-semibold text-gray-600 tracking-wider">City/Area</th>
                                                    <th className="text-right px-4 py-2 font-semibold text-gray-600 tracking-wider">Direct</th>
                                                    <th className="text-right px-4 py-2 font-semibold text-gray-600 tracking-wider">Indirect</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.geographyBreakdown.map((geo, index) => (
                                                    <tr key={index} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="px-4 py-2">{geo.country}</td>
                                                        <td className="px-4 py-2">{geo.region || 'N/A'}</td>
                                                        <td className="px-4 py-2">{geo.city}</td>
                                                        <td className="px-4 py-2 text-right">{geo.directBeneficiaries ?? 0}</td>
                                                        <td className="px-4 py-2 text-right">{geo.indirectBeneficiaries ?? 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                             {report.detailedEthnicities && report.detailedEthnicities.length > 0 && (
                                <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">Ethnicity Breakdown</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5">
                                        {report.detailedEthnicities.map((ethnicity, index) => (
                                            <li key={index}>{ethnicity}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-between items-center space-x-3 bg-gray-50 py-4 px-6 sm:px-8 border-t border-gray-200">
                         <Button
                            variant="outline"
                            onClick={() => router.push('/mercy-mission')}
                            className="px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 transition-colors duration-150"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
                        </Button>
                        {report.status === 'submitted' && (
                            <div className="flex space-x-3">
                                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Approve Report</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to approve this report? Once approved, it cannot be edited.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="mt-4">
                                            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
                                            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={confirmApprove}>Confirm Approval</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                            onClick={() => {
                                                // Optionally reset rejectionComment here if you want it blank each time dialog is opened
                                                // setRejectionComment(''); // This would clear it, but RejectionModalContent now handles initial state
                                                setIsRejectDialogOpen(true);
                                            }}
                                        >
                                            <XCircle className="mr-1.5 h-4 w-4" /> Reject
                                        </Button>
                                    </DialogTrigger>
                                    <RejectionModalContent
                                        isOpen={isRejectDialogOpen}
                                        onOpenChange={setIsRejectDialogOpen}
                                        initialComment={rejectionComment}
                                        onConfirmReject={handleActualReject}
                                        onDebouncedCommentChange={handleDebouncedCommentChange}
                                    />
                                </Dialog>
                            </div>
                        )}
                        {report.status === 'approved' && (
                            <div className="flex items-center space-x-3">
                                
                                <Button
                                    variant="default"
                                    onClick={handlePrint}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <Download className="mr-1.5 h-4 w-4" /> Download Report
                                </Button>
                            </div>
                        )}
                        {report.status === 'rejected' && <span className="text-sm font-medium text-red-600">Report Rejected</span>}
                    </CardFooter>
                </Card>

                {/* Hidden PrintableReport component */}
                {report && (
                    <div style={{ display: 'none' }}> {/* Wrapper to hide the component */}
                        <PrintableReport ref={printableContentRef} report={report} />
                    </div>
                )}

            </main>
        </div>
    );
} 