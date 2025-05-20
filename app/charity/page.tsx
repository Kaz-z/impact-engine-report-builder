"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, FileText, Edit, PlusCircle, Eye, CheckCircle as CheckCircleIcon, AlertCircle, XCircle } from "lucide-react";
import { Loading } from "../components/Loading";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCardProps, Project } from "../../app/types/types";
import Header from "../components/Header";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authContext";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import { useLoading } from "../context/loadingContext";
// Sample project data
const sampleProjects: Project[] = [
  {
    id: "1",
    projectName: "School Building",
    fundingAmount: 15000,
    dateFundingGiven: new Date("01/01/2025"),
    objectives: {
      objective1: "Build 2 classrooms",
      objective2: "Install a water purifier",
    },
    dateImpactReportDue: new Date("01/07/2025"),
    impactReport: {},
    impactReportStatus: 'draft',
  },
  {
    id: "2",
    projectName: "Community Health Center",
    fundingAmount: 25000,
    dateFundingGiven: new Date("02/15/2025"),
    objectives: {
      objective1: "Purchase medical equipment",
      objective2: "Train 5 community health workers",
      objective3: "Stock essential medicines",
    },
    dateImpactReportDue: new Date("08/15/2025"),
    impactReport: {},
    impactReportStatus: 'submitted',
  },
  {
    id: "3",
    projectName: "Agricultural Training",
    fundingAmount: 8500,
    dateFundingGiven: new Date("12/10/2024"),
    objectives: {
      objective1: "Train 20 farmers in sustainable practices",
      objective2: "Distribute drought-resistant seeds",
    },
    dateImpactReportDue: new Date("06/10/2025"),
    impactReport: {},
    impactReportStatus: 'approved',
  },  
];

export default function CharityDashboard() {
  const [projects, setProjects] = useState(sampleProjects);
  const { user } = useAuth(); // Get the user from the auth context
  const [sortOption, setSortOption] = useState("report-soon");
  const [dateFilter, setDateFilter] = useState("all");
  const [charity, setCharity] = useState("");
  const [charityRegNumber, setCharityRegNumber] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCharityData = async () => {
      setLoading(true);
      try {
        if (user) {
          // Fetch charity info
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const charityName = userDocSnap.data().charityName;
            setCharity(charityName);
            
            // Get the charity registration number from the 'charity' collection
            const charityDocRef = doc(db, "charities", charityName);
            const charityDocSnap = await getDoc(charityDocRef);
            
            if (charityDocSnap.exists() && charityDocSnap.data().charityNumber) {
              setCharityRegNumber(charityDocSnap.data().charityNumber);
            } else {
              console.log("No charity registration number found");
            }
            
            console.log("charityName", charityName);
            // Fetch projects for this charity
            await fetchProjects(charityName);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharityData();
  }, [user]);

  // Function to fetch projects for a specific charity
  const fetchProjects = async (charityName: string) => {
    try {
      // Use the exact document ID as shown in Firestore
      // Note: If the charity name has spaces, we need to use it as-is in the path
      const projectsCollection = collection(db, "charities", charityName, "projects");
      console.log(`Attempting to fetch projects from: charities/${charityName}/projects`);
      
      const querySnapshot = await getDocs(projectsCollection);
      console.log("Query snapshot:", querySnapshot.size, "documents found");
      
      if (!querySnapshot.empty) {
        const projectsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Project data:", data);
          return {
            id: doc.id,
            projectName: data.projectName || "Unnamed Project",
            fundingAmount: data.fundingAmount || 0,
            dateFundingGiven: data.dateFundingGiven?.toDate() || new Date(),
            dateImpactReportDue: data.dateImpactReportDue?.toDate() || new Date(),
            objectives: data.objectives || {},
            impactReport: data.impactReport || {},
            impactReportStatus: data.impactReportStatus || 'not-started'
          } as Project;
        });
        
        console.log("Processed projects:", projectsData);
        setProjects(projectsData);
      } else {
        console.log("No projects found for this charity. Using sample data.");
        setProjects(sampleProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects(sampleProjects); // Fall back to sample data on error
    }
  };

  if (!user) {
    return <Loading />; // Or redirect to login
  }

  if (loading) {
    return <Loading />;
  }

  // Calculate days remaining until impact report is due
  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge for impact report - UPDATED FOR APPROVED STATE
  const getReportStatusBadge = (status: string | undefined, dueDate: Date) => {
    if (status === 'approved') {
      return <Badge className="bg-green-500 text-white"><CheckCircleIcon className="mr-1 h-3 w-3" /> Approved</Badge>;
    }
    if (status === 'submitted') {
      return <Badge variant="secondary"><FileText className="mr-1 h-3 w-3" /> Submitted</Badge>;
    }
    if (status === 'rejected') {
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
    }
    if (status === 'draft') {
        return <Badge className="bg-orange-600/90 text-white"><Edit className="mr-1 h-3 w-3" /> Draft</Badge>;
    }

    const daysRemaining = getDaysRemaining(dueDate);
    if (daysRemaining < 0) {
      return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3"/> Overdue</Badge>;
    }
    if (daysRemaining < 30) {
      return <Badge variant="destructive" className="bg-amber-500 text-white"><Clock className="mr-1 h-3 w-3" /> Due Soon</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>; // Default or Not Started
  };

  // Calculate progress percentage (time elapsed since funding)
  const getProgressPercentage = (startDate: Date, endDate: Date) => {
    const today = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();

    if (elapsed < 0) return 0;
    if (elapsed > total) return 100;

    return Math.round((elapsed / total) * 100);
  };

  const filterProjectsByDate = (projects: Project[]) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Last day of current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endOfMonth = new Date(currentYear, currentMonth, lastDayOfMonth);

    // 3 months from now
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    switch (dateFilter) {
      case "this-month":
        return projects.filter((p) => {
          const dueDate = p.dateImpactReportDue;
          return dueDate >= today && dueDate <= endOfMonth;
        });
      case "next-3-months":
        return projects.filter((p) => {
          const dueDate = p.dateImpactReportDue;
          return dueDate >= today && dueDate <= threeMonthsLater;
        });
      case "overdue":
        return projects.filter((p) => p.dateImpactReportDue < today);
      default:
        return projects;
    }
  };

  const sortProjects = (projects: Project[]) => {
    const sortedProjects = [...projects];

    switch (sortOption) {
      case "name-asc":
        return sortedProjects.sort((a, b) =>
          a.projectName.localeCompare(b.projectName)
        );
      case "name-desc":
        return sortedProjects.sort((a, b) =>
          b.projectName.localeCompare(a.projectName)
        );
      case "funding-high":
        return sortedProjects.sort((a, b) => b.fundingAmount - a.fundingAmount);
      case "funding-low":
        return sortedProjects.sort((a, b) => a.fundingAmount - b.fundingAmount);
      case "date-newest":
        return sortedProjects.sort(
          (a, b) => {
            if (b.dateFundingGiven && a.dateFundingGiven) {
              return b.dateFundingGiven.getTime() - a.dateFundingGiven.getTime();
            }
            return 0;
          }
        );
      case "date-oldest":
        return sortedProjects.sort(
          (a, b) => {
            if (a.dateFundingGiven && b.dateFundingGiven) {
              return a.dateFundingGiven.getTime() - b.dateFundingGiven.getTime();
            }
            return 0;
          }
        );
      case "report-soon":
        return sortedProjects.sort(
          (a, b) =>
            a.dateImpactReportDue.getTime() - b.dateImpactReportDue.getTime()
        );
      default:
        return sortedProjects;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-6 bg-orange-50/30">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  {charity}&apos;s Dashboard
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage and track your funded projects
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                 {/* Filters/Sort */}
                 <div className="w-full sm:w-auto">
                  <Label htmlFor="sort" className="text-xs mb-1 block text-muted-foreground">
                    Sort by
                  </Label>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger id="sort" className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Sort projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Project Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Project Name (Z-A)</SelectItem>
                      <SelectItem value="funding-high">Funding (High-Low)</SelectItem>
                      <SelectItem value="funding-low">Funding (Low-High)</SelectItem>
                      <SelectItem value="date-newest">Funded Date (Newest)</SelectItem>
                      <SelectItem value="date-oldest">Funded Date (Oldest)</SelectItem>
                      <SelectItem value="report-soon">Report Due (Soonest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-auto">
                  <Label htmlFor="filter-date" className="text-xs mb-1 block text-muted-foreground">
                    Filter Report Date
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="filter-date" className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Due Dates</SelectItem>
                      <SelectItem value="this-month">Due This Month</SelectItem>
                      <SelectItem value="next-3-months">Due Next 3 Months</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="mt-4">
              <TabsList>
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                {charity === "Barrow-in-Furness Enterprise & Employability" && (
                  <img
                    className="w-full h-96 rounded-md object-cover mb-8"
                    src="https://res.cloudinary.com/subframe/image/upload/v1747780394/uploads/13131/pnnytpawyoltajejfcsh.png"
                    alt="Barrow-In-Furness"
                  />
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortProjects(filterProjectsByDate(projects)).map((project) => (
                    <div className="h-full" key={project.id}>
                      <ProjectCard
                        project={project}
                        getReportStatusBadge={getReportStatusBadge}
                        getProgressPercentage={getProgressPercentage}
                        charityName={charity}
                        charityRegNumber={charityRegNumber}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-6">
                {charity === "Barrow-in-Furness Enterprise & Employability" && (
                  <img
                    className="w-full h-96 rounded-md object-cover mb-8"
                    src="https://res.cloudinary.com/subframe/image/upload/v1747780394/uploads/13131/pnnytpawyoltajejfcsh.png"
                    alt="Barrow-In-Furness"
                  />
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortProjects(
                    projects.filter(
                      (p) => getDaysRemaining(p.dateImpactReportDue) > 0
                    )
                  ).map((project) => (
                    <div className="h-full" key={project.id}>
                      <ProjectCard
                        project={project}
                        getReportStatusBadge={getReportStatusBadge}
                        getProgressPercentage={getProgressPercentage}
                        charityName={charity}
                        charityRegNumber={charityRegNumber}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ProjectCard({
  project,
  getReportStatusBadge,
  getProgressPercentage,
  charityName,
  charityRegNumber
}: ProjectCardProps) {
  const router = useRouter();
  const { startLoading } = useLoading();
  
  const progressPercentage = project.dateFundingGiven && project.dateImpactReportDue ? getProgressPercentage(
    project.dateFundingGiven,
    project.dateImpactReportDue
  ) : 0;

  const daysRemaining = project.dateImpactReportDue ? Math.max(
    0,
    Math.ceil(
      (project.dateImpactReportDue.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  ) : 0;

  // Check if this would be an early submission (more than 30 days before due date)
  const isEarlySubmission = daysRemaining > 30;
  
  // Get appropriate icon, text, and STYLED BUTTON based on report status from DB
  const getButtonContent = (): React.ReactNode => {
    let buttonClass = "w-full";
    let buttonContent: React.ReactNode;

    switch (project.impactReportStatus) {
      case 'draft':
        buttonClass += " bg-orange-600/90 hover:bg-orange-700/90 text-white"; // Orange for draft
        buttonContent = (
          <span className="flex items-center justify-center">
            <Edit className="mr-2 h-4 w-4" />
            Continue Impact Report
          </span>
        );
        break;
      case 'submitted':
        buttonClass += " bg-gray-500 hover:bg-gray-600 text-white"; // Grey for view-only submitted
        buttonContent = (
          <span className="flex items-center justify-center">
            <Eye className="mr-2 h-4 w-4" />
            View Submitted Report
          </span>
        );
        break;
      case 'rejected': // MODIFIED CASE for rejected
        buttonClass += " bg-yellow-500 hover:bg-yellow-600 text-white"; // Yellow/Orange for revise
        buttonContent = (
          <span className="flex items-center justify-center">
            <Edit className="mr-2 h-4 w-4" />
            Revise & Resubmit Report
          </span>
        );
        break;
      case 'approved': // Modified case for approved
        return (
          <Button
            size="sm"
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white" // Make it full width
            onClick={handleNavigate}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Impact Report
          </Button>
        );
      default: // No status or other status - show Submit/Early Submit
        buttonClass += " bg-orange-600/90 hover:bg-orange-700/90 text-white"; // Orange for submit
        if (isEarlySubmission) {
            buttonContent = (
                <span className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Impact Report Early
                </span>
            );
        } else {
            buttonContent = (
                <span className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Impact Report
                </span>
            );
        }
        break;
    }

    // Return the complete Button component for other statuses
    return (
      <Button className={buttonClass} onClick={handleNavigate}>
        {buttonContent}
      </Button>
    );
  };

  // Handle navigation with loading state
  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    startLoading();
    // Add flags as needed, like early submission
    const earlyParam = isEarlySubmission && !project.impactReportStatus ? '&early=true' : '';
    const dueDateParam = `&dueDate=${encodeURIComponent(project.dateImpactReportDue.toISOString())}`;
    // Navigate to the report page (edit or view based on status)
    router.push(`/project/${project.id}/impact-report?charity=${encodeURIComponent(charityName)}&regNumber=${encodeURIComponent(charityRegNumber)}${earlyParam}${dueDateParam}`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.projectName}</CardTitle>
            <CardDescription className="mt-1">
              Funded: ${project.fundingAmount.toLocaleString()}
            </CardDescription>
          </div>
          {/* Use updated getReportStatusBadge */}
          {getReportStatusBadge(project.impactReportStatus, project.dateImpactReportDue)}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Objectives</h4>
          <ul className="space-y-1">
            {Object.values(project.objectives).map((objective, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="mr-2 text-primary">•</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Funded: {project.dateFundingGiven ? format(project.dateFundingGiven, "MMM d, yyyy") : 'N/A'}
            </span>
            <span className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Report due: {project.dateImpactReportDue ? format(project.dateImpactReportDue, "MMM d, yyyy") : 'N/A'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Project timeline</span>
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {daysRemaining} days remaining
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        {/* Render the button returned by getButtonContent */}
        {getButtonContent()}
      </CardFooter>
    </Card>
  );
}

