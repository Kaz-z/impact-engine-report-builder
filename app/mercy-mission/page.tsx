"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Filter, Search, Landmark, Target, Handshake } from "lucide-react";
import { Loading } from "../components/Loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "../components/Header";
import { CharityReportCard } from "./components/CharityReportCard";
import { useRouter } from "next/navigation";
import { useLoading } from "../context/loadingContext";
import { db } from "@/firebase"; // Import db instance
import { collection, getDocs, Timestamp } from "firebase/firestore"; // Import Firestore functions
import { Project } from "../types/types";

// --- Remove Placeholder Data ---
// const placeholderCharities: DAFCharityInfo[] = [ ... ];
// --- End Remove Placeholder Data ---


export default function MercyMissionDashboard() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  const [charities, setCharities] = useState<Project[]>([]);
  const [filteredCharities, setFilteredCharities] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'submitted', 'due-soon', 'overdue', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState(""); // Added state for search query
  const [loading, setLoading] = useState(true); // Local loading state for this component

  // Calculate metrics using useMemo
  const totalInvestment = useMemo(() => {
    return filteredCharities.reduce((sum, project) => sum + (project.fundingAmount || 0), 0);
  }, [filteredCharities]);

  const numberOfProjects = useMemo(() => {
    return filteredCharities.length;
  }, [filteredCharities]);

  const partnersEngagedCount = useMemo(() => {
    return filteredCharities.filter(project => project.impactReport?.hasPartners === true).length;
  }, [filteredCharities]);

  useEffect(() => {
    // Fetch data from Firestore
    const fetchData = async () => {
      setLoading(true);
      startLoading();
      console.log("Fetching charity and project data for DAF...");

      const allProjectsData: Project[] = [];

      try {
        // 1. Fetch all charity documents from the root 'charities' collection
        const charitiesCollectionRef = collection(db, "charities");
        const charitiesSnapshot = await getDocs(charitiesCollectionRef);
        console.log(`Found ${charitiesSnapshot.size} charities.`);

        // 2. For each charity, fetch its projects
        // Use Promise.all to fetch projects concurrently for all charities
        await Promise.all(charitiesSnapshot.docs.map(async (charityDoc) => {
            const charityId = charityDoc.id; // Charity name is the document ID
            console.log(`Processing charity: ${charityId}`);

            const projectsCollectionRef = collection(db, "charities", charityId, "projects");
            const projectsSnapshot = await getDocs(projectsCollectionRef);
            console.log(`Found ${projectsSnapshot.size} projects for ${charityId}.`);

            projectsSnapshot.forEach((projectDoc) => {
                const projectId = projectDoc.id;
                const projectData = projectDoc.data();

                // 3. Map project data to DAFCharityInfo structure
                const projectInfo: Project = {
                    id: projectId, // Use charity ID for the card key if needed, but projectId links actions
                    name: charityId, // Charity name
                    
                    projectName: projectData.projectName || "Unnamed Project",
                    reportStatus: projectData.impactReportStatus || 'Not Started', // Default status
                    // Convert Timestamps to Dates, handle null/undefined
                    dateImpactReportDue: projectData.dateImpactReportDue instanceof Timestamp
                        ? projectData.dateImpactReportDue.toDate()
                        : new Date(),
                    lastUpdated: projectData.lastUpdated instanceof Timestamp
                        ? projectData.lastUpdated.toDate()
                        : new Date(),
                    fundingAmount: projectData.fundingAmount || 0,
                    dateFundingGiven: projectData.dateFundingGiven instanceof Timestamp
                        ? projectData.dateFundingGiven.toDate()
                        : null,
                    objectives: projectData.objectives || {},
                    impactReport: projectData.impactReport || {},
                    rejectionComment: projectData.rejectionComment || '',
                };
                allProjectsData.push(projectInfo);
            });
        }));

        console.log("Successfully fetched all projects:", allProjectsData);
        setCharities(allProjectsData);
        setFilteredCharities(allProjectsData); // Initialize filtered list

      } catch (error) {
        console.error("Error fetching charity/project data from Firestore:", error);
        // Handle error state, maybe show a message to the user
        setCharities([]);
        setFilteredCharities([]);
        // Consider adding a toast notification for the error
      } finally {
         // Add a small delay for smoother transition
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
        stopLoading();
        console.log("Finished fetching data.");
      }
    };

    fetchData();

  }, [startLoading, stopLoading]);

  // Filter charities (projects) based on selected status and search query
  useEffect(() => {
    let tempFiltered = charities;

    // Apply status filter
    if (statusFilter !== "all") {
        tempFiltered = tempFiltered.filter(project => {
            // Normalize status for comparison (lowercase, replace space with dash if needed)
            const normalizedStatus = (project.reportStatus || '').toLowerCase().replace(/\s+/g, '-');
            return normalizedStatus === statusFilter;
        });
    }

    // Apply search filter (search charity name or project name)
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        tempFiltered = tempFiltered.filter(project =>
            project.name?.toLowerCase().includes(lowerQuery) ||
            (project.projectName && project.projectName.toLowerCase().includes(lowerQuery))
        );
    }

    setFilteredCharities(tempFiltered);
}, [statusFilter, searchQuery, charities]);

  // Navigate to the report review page
  const handleViewReport = (charityId: string, projectId: string | undefined) => {
      if (!projectId) {
          console.warn("No project ID available for charity:", charityId);
          // Optionally show a message to the user
          return;
      }
      console.log(`Navigating to review report ${projectId} for charity ${charityId}`);
      // Define the review path
      const path = `/mercy-mission/review/${projectId}?charityId=${charityId}`;
      startLoading();
      router.push(path);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Removed userType prop */}
      <main className="flex-grow p-6 bg-gray-50">
        

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">Charity Impact Reports</CardTitle>
                <CardDescription className="mt-2">Review and manage reports submitted by charities in your network.</CardDescription>
              </div>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search charities/projects..." // Updated placeholder
                        className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 {/* Status Filter Dropdown */}
                 <div className="flex items-center space-x-2 w-full sm:w-auto">
                     <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="due-soon">Due Soon</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                             <SelectItem value="not-started">Not Started</SelectItem>
                            {/* Add other statuses if needed */}
                        </SelectContent>
                    </Select>
                 </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Metric Cards Section - Moved here and restyled */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Investment Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-cyan-50 rounded-t-lg">
                  <CardTitle className="text-sm font-medium">
                    Total Investment
                  </CardTitle>
                  <Landmark className="h-4 w-4 text-cyan-600" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold">
                    £{totalInvestment.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Active Projects Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 rounded-t-lg">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold">{numberOfProjects}</div>
                </CardContent>
              </Card>

              {/* Partners Engaged Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-orange-50 rounded-t-lg">
                  <CardTitle className="text-sm font-medium">
                    Partners Engaged
                  </CardTitle>
                  <Handshake className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold">{partnersEngagedCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Grid layout for charity cards */}
            {filteredCharities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Ensure unique key for each card, using projectId if available */}
                    {filteredCharities.map((project) => (
                        <CharityReportCard
                            key={project.id || project.name} // Use projectId as key for uniqueness
                            charity={project} // Pass the combined project info
                            onViewReport={handleViewReport}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    {loading ? "Loading reports..." : "No reports found matching the filter or search criteria."}
                </div>
            )}
          </CardContent>
        </Card>
      </main>
      {/* Footer can be added here if needed */}
    </div>
  );
}

// TODO: Define or import the DAFCharityInfo type in `../types/types.ts`
// Example structure:
// export interface DAFCharityInfo {
//   id: string;
//   name: string;
//   reportStatus: 'Submitted' | 'Approved' | 'Rejected' | 'Due Soon' | 'Overdue' | 'Pending'; // Or other relevant statuses
//   reportDeadline: Date | null;
//   lastUpdated: Date | null;
//   projectId?: string; // ID of the latest/relevant impact report
//   // Add other relevant fields like contact info, etc.
// }


