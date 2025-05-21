"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import {
  // CalendarIcon, // Unused
  Save as SaveIcon,
  CheckCircle,
  // Edit, // REMOVE UNUSED ICON
  PlusCircle,
  ArrowLeft,
  Search,
  Calendar as CalendarIconOutline,
  Info as InfoIcon, // Add InfoIcon for the Alert
  Download as DownloadIcon, // Add Download icon import
  // FileText, // Unused
} from "lucide-react";
import { toast } from "sonner";
// import { Progress } from "@/components/ui/progress"; // Unused
import { doc, updateDoc, serverTimestamp, getDoc, Timestamp } from "firebase/firestore"; // <-- Add Firestore imports
import { db } from "@/firebase"; // <-- Import db instance

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
} from "@/components/ui/form";
// Remove Select imports if not used directly in this file
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar"; // Unused
import Header from "@/app/components/Header";
import { useAuth } from "@/app/context/authContext";
import { useLoading } from "@/app/context/loadingContext";
import { Loading } from "@/app/components/Loading";
import ProjectDetailsStep from "./components/steps/ProjectDetailsStep";
import ExpectedOutcomesStep from "./components/steps/ExpectedOutcomesStep";
import AchievedOutcomesStep from "./components/steps/AchievedOutcomesStep";
import OutcomeAnalysisStep from "./components/steps/OutcomeAnalysisStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

// Import react-to-print
import { useReactToPrint } from 'react-to-print'; 

// Define schema for image file metadata
const fileMetadataSchema = z.object({
  url: z.string(),
  fileName: z.string().optional(),
  uploadedAt: z.string().optional(), // Assuming ISO string format
});

// List of countries
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea, North",
  "Korea, South",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// Create a schema for form validation
const formSchema = z
  .object({
    organizationName: z
      .string()
      .min(1, "Organization name is required")
      .max(255),
    charityRegistrationNumber: z.string().max(50),
    totalFundingAmount: z
      .number()
      .positive("Amount must be positive")
      .or(
        z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    dateFundingStarted: z.date({
      required_error: "Date funding started is required",
    }),
    priorityObjective: z.string({
      required_error: "Please select a priority objective",
    }),
    coverageObjective: z.string({
      required_error: "Please select an objective",
    }),
    projectName: z.string().min(1, "Project name is required").max(100),
    projectSummary: z.string().min(1, "Project summary is required"),
    projectCountry: z
      .array(z.string())
      .min(1, "Please select at least one country"),
    partnerOrganizations: z
      .string()
      .max(255)
      .optional(),
    partnershipInvolvement: z
      .number()
      .min(0, "Must be at least 0")
      .max(100, "Must not exceed 100")
      .or(z.string().regex(/^\d+$/).transform(Number))
      .optional(),
    contactName: z.string().min(1, "Contact name is required").max(100),
    position: z.string().min(1, "Position is required").max(100),
    email: z.string().email("Invalid email address"),
    telephone: z
      .string()
      .min(1, "Telephone is required")
      .regex(/^\+?[0-9\s]+$/, "Invalid telephone format"),
    dateImpactReportSubmitted: z.date({
      required_error: "Date impact report submitted is required",
    }),
    hasPartners: z.boolean().default(false),
    // Add outcome fields
    outcome1Qualitative: z
      .string()
      .min(1, "Outcome 1 qualitative description is required")
      .max(500, "Maximum 500 characters"),
    outcome1Quantitative: z
      .string()
      .min(1, "Outcome 1 quantitative measure is required")
      .max(255, "Maximum 255 characters"),
    includeOutcome2: z.boolean().nullable().optional().default(false),
    outcome2Qualitative: z
      .string()
      .max(500, "Maximum 500 characters")
      .optional(),
    outcome2Quantitative: z
      .string()
      .max(255, "Maximum 255 characters")
      .optional(),
    includeOutcome3: z.boolean().nullable().optional().default(false),
    outcome3Qualitative: z
      .string()
      .max(500, "Maximum 500 characters")
      .optional(),
    outcome3Quantitative: z
      .string()
      .max(255, "Maximum 255 characters")
      .optional(),
    // Achieved Outcomes fields (placeholder)
    outcome1Achieved: z.string().optional(),
    outcome1FundingPlanned: z.number().min(0, "Must be at least 0").default(0)
      .or(z.string().regex(/^\d*$/).transform(v => v === '' ? 0 : Number(v))),
    outcome1FundingSpent: z.number().min(0, "Must be at least 0").default(0)
      .or(z.string().regex(/^\d*$/).transform(v => v === '' ? 0 : Number(v))),
    outcome1DifferenceReason: z.string().nullable().optional(),
    outcome1SurplusPlans: z.string().nullable().optional(),
    outcome1AmountLeftOver: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const num = parseFloat(val);
                return isNaN(num) ? 0 : num;
            }
            if (typeof val === 'number') {
                return val;
            }
            return 0;
        },
        z.number().min(0, "Must be at least 0").default(0)
    ),
    includeAchievedOutcome2: z.boolean().nullable().optional().default(false),
    outcome2Achieved: z.string().optional(),
    outcome2FundingPlanned: z.number().min(0, "Must be at least 0").default(0)
      .or(z.string().regex(/^\d*$/).transform(v => v === '' ? 0 : Number(v))),
    outcome2FundingSpent: z.number().min(0, "Must be at least 0").default(0)
      .or(z.string().regex(/^\d*$/).transform(v => v === '' ? 0 : Number(v))),
    outcome2DifferenceReason: z.string().nullable().optional(),
    outcome2SurplusPlans: z.string().nullable().optional(),
    outcome2AmountLeftOver: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const num = parseFloat(val);
                return isNaN(num) ? 0 : num;
            }
            if (typeof val === 'number') {
                return val;
            }
            return 0;
        },
        z.number().min(0, "Must be at least 0").default(0)
    ),
    // Add Missing Achieved Outcome 3 fields
    includeAchievedOutcome3: z.boolean().nullable().optional().default(false),
    outcome3Achieved: z.string().max(500, "Max 500 characters").optional(), // Added length constraint
    // Outcome 3 Funding/Difference fields are assumed to be defined earlier if includeOutcome3 is true

    // Add Outcome Benefit Analysis fields - Use preprocess for all counts
    directBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    indirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    maleBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    femaleBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    under18Beneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    age18to34Beneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    age35to54Beneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    over55Beneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    // NEW indirect gender fields
    maleIndirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    femaleIndirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    // NEW indirect age fields
    under18IndirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    age18to34IndirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    age35to54IndirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    over55IndirectBeneficiaries: z.preprocess(
        (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
        z.number().min(0, "Must be at least 0").default(0)
    ),
    // Geographic breakdown fields - REMOVED OLD, ADD NEW
    geographyBreakdown: z.array(z.object({
      country: z.string().min(1, "Country is required"),
      region: z.string().optional(), // Optional field
      city: z.string().min(1, "City is required"),
      // Apply preprocess here too
      directBeneficiaries: z.preprocess(
          (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
          z.number().min(0).default(0)
      ),
      indirectBeneficiaries: z.preprocess(
          (val) => typeof val === 'string' ? (parseFloat(val) || 0) : (typeof val === 'number' ? val : 0),
          z.number().min(0).default(0)
      ),
    })).optional().default([]),
    // Add new detailed ethnicity fields
    detailedEthnicities: z.array(z.string()).optional().default([]),
    otherWhiteBackground: z.string().optional(),
    otherMixedBackground: z.string().optional(),
    otherAsianBackground: z.string().optional(),
    otherBlackBackground: z.string().optional(),
    otherEthnicGroup: z.string().optional(),
    // Add fields for supporting images for each outcome
    outcome1Images: z.array(fileMetadataSchema).optional().default([]),
    outcome2Images: z.array(fileMetadataSchema).optional().default([]),
    outcome3Images: z.array(fileMetadataSchema).optional().default([]),
    // ADD SUPPORTING MATERIAL FIELDS TO SCHEMA
    outcome1Story: z.string().max(1500, "Max 1500 characters").optional(),
    outcome1Interviews: z.string().optional(),
    outcome1SocialMedia: z.string().optional(),
    outcome2Story: z.string().max(1500, "Max 1500 characters").optional(),
    outcome2Interviews: z.string().optional(),
    outcome2SocialMedia: z.string().optional(),
    outcome3Story: z.string().max(1500, "Max 1500 characters").optional(),
    outcome3Interviews: z.string().optional(),
    outcome3SocialMedia: z.string().optional(),
    locality: z.string().min(1, "Locality is required"),
    region: z.string().min(1, "Region is required"),
    city: z.string().min(1, "City is required"),
    postcode: z.string().optional(),
  })
  // Transform to set includeAchievedOutcome flags based on achieved data
  .transform((data) => {
    if (data.outcome2Achieved && data.outcome2Achieved.trim() !== "") {
        data.includeAchievedOutcome2 = true;
    }
    if (data.outcome3Achieved && data.outcome3Achieved.trim() !== "") {
        data.includeAchievedOutcome3 = true;
    }
    return data;
  })
  // Add refine checks for conditional partner fields
  .refine(
    (data) => {
      // If partners are used, organization names are required
      if (data.hasPartners) {
        return !!data.partnerOrganizations && data.partnerOrganizations.length > 0;
      }
      return true; // Otherwise, validation passes
    },
    {
      message: "Partner organizations are required when partners are used",
      path: ["partnerOrganizations"], // Apply error to this field
    }
  )
  .refine(
    (data) => {
      // If partners are used, involvement percentage is required
      if (data.hasPartners) {
        return data.partnershipInvolvement !== undefined && data.partnershipInvolvement !== null && data.partnershipInvolvement >= 0;
      }
      return true; // Otherwise, validation passes
    },
    {
      message: "Partnership involvement percentage is required when partners are used",
      path: ["partnershipInvolvement"], // Apply error to this field
    }
  )
  .refine(
    (data) => {
      // If includeOutcome2 is true, outcome2Qualitative and outcome2Quantitative are required
      if (data.includeOutcome2) {
        return !!data.outcome2Qualitative && !!data.outcome2Quantitative;
      }
      return true;
    },
    {
      message: "Outcome 2 details are required when included",
      path: ["outcome2Qualitative"],
    }
  )
  .refine(
    (data) => {
      // If includeOutcome3 is true, outcome3Qualitative and outcome3Quantitative are required
      if (data.includeOutcome3) {
        return !!data.outcome3Qualitative && !!data.outcome3Quantitative;
      }
      return true;
    },
    {
      message: "Outcome 3 details are required when included",
      path: ["outcome3Qualitative"],
    }
  )
  // Add refine checks for conditional ethnicity description fields
  .refine(
    (data) => {
      if (data.detailedEthnicities?.includes("Any other White background, please describe")) {
        return !!data.otherWhiteBackground && data.otherWhiteBackground.length > 0;
      }
      return true;
    },
    {
      message: "Please describe the 'Other White background'",
      path: ["otherWhiteBackground"],
    }
  )
  .refine(
    (data) => {
      if (data.detailedEthnicities?.includes("Any other Mixed/Multiple ethnic background, please describe")) {
        return !!data.otherMixedBackground && data.otherMixedBackground.length > 0;
      }
      return true;
    },
    {
      message: "Please describe the 'Other Mixed background'",
      path: ["otherMixedBackground"],
    }
  )
  .refine(
    (data) => {
      if (data.detailedEthnicities?.includes("Any other Asian background, please describe")) {
        return !!data.otherAsianBackground && data.otherAsianBackground.length > 0;
      }
      return true;
    },
    {
      message: "Please describe the 'Other Asian background'",
      path: ["otherAsianBackground"],
    }
  )
  .refine(
    (data) => {
      if (data.detailedEthnicities?.includes("Any other Black/African/Caribbean background, please describe")) {
        return !!data.otherBlackBackground && data.otherBlackBackground.length > 0;
      }
      return true;
    },
    {
      message: "Please describe the 'Other Black background'",
      path: ["otherBlackBackground"],
    }
  )
  .refine(
    (data) => {
      if (data.detailedEthnicities?.includes("Any other ethnic group, please describe")) {
        return !!data.otherEthnicGroup && data.otherEthnicGroup.length > 0;
      }
      return true;
    },
    {
      message: "Please describe the 'Other ethnic group'",
      path: ["otherEthnicGroup"],
    }
  )
  // Add refine check for projectSummary word count
  .refine(
    (data) => {
      const summary = data.projectSummary || '';
      const wordCount = summary.trim().split(/\s+/).filter(Boolean).length;
      return wordCount <= 50;
    },
    {
      message: "Project summary must be 50 words or less",
      path: ["projectSummary"],
    }
  );

// Export the FormValues type
export type FormValues = z.infer<typeof formSchema> & {
  // Ensure fields that can be null/optional in Zod are reflected here if needed
  maleIndirectBeneficiaries?: number;
  femaleIndirectBeneficiaries?: number;
  under18IndirectBeneficiaries?: number;
  age18to34IndirectBeneficiaries?: number;
  age35to54IndirectBeneficiaries?: number;
  over55IndirectBeneficiaries?: number;

  // Ensure explicit Achieved Outcome 3 fields are present if not inferred correctly
  includeAchievedOutcome3?: boolean | null; // Explicitly add if needed
  outcome3Achieved?: string;
  outcome3FundingPlanned?: number;
  outcome3FundingSpent?: number;
  outcome3DifferenceReason?: string | null; // Allow null
  outcome3SurplusPlans?: string | null; // Allow null
  outcome3AmountLeftOver?: number;

  // Supporting materials fields
  outcome1Story?: string;
  outcome1Interviews?: string;
  outcome1SocialMedia?: string;
  outcome2Story?: string;
  outcome2Interviews?: string;
  outcome2SocialMedia?: string;
  outcome3Story?: string;
  outcome3Interviews?: string;
  outcome3SocialMedia?: string;
  partnerContract?: {
    name: string;
    url: string;
    uploadedAt?: string;
    fileName?: string;
  };
  locality: string;
  region: string;
  city: string;
  postcode?: string;
};

// Define type for Firestore data structure (dates as strings)
// Omit date fields from FormValues and add them back as string | null
type FirestoreReportData = Omit<FormValues, 'dateFundingStarted' | 'dateImpactReportSubmitted'> & {
  dateFundingStarted: string | null;
  dateImpactReportSubmitted: string | null;
  // Add other fields that might differ or need specific Firestore handling if any
};

// Existing ProjectData interface
interface ProjectData {
  id: string;
  name: string;
}

// Country selection component with search and multiple selection functionality
function CountrySelect({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      // Short delay to ensure the dropdown is fully open
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Clear search when dropdown closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Handle country selection and deselection
  const handleSelect = (country: string) => {
    if (value.includes(country)) {
      // Remove country if already selected
      onChange(value.filter((val) => val !== country));
    } else {
      // Add country if not selected
      onChange([...value, country]);
    }
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            {value.length === 0 ? (
              <span className="text-muted-foreground">Select countries...</span>
            ) : value.length === 1 ? (
              value[0]
            ) : (
              <span className="truncate">
                {value.slice(0, 2).join(", ")}
                {value.length > 2 ? ` + ${value.length - 2} more` : ""}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[300px] p-0" align="start">
          <div className="flex items-center border-b px-3 pb-2 pt-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={searchInputRef}
              placeholder="Search for countries..."
              className="h-8 border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              onKeyDown={(e) => {
                // Prevent form submission when Enter is pressed in the search box
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
          </div>
          {searchQuery && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {filteredCountries.length}{" "}
              {filteredCountries.length === 1 ? "country" : "countries"} found
            </div>
          )}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCountries.length > 0 ? (
              <div className="grid gap-1 p-1">
                {filteredCountries.map((country) => {
                  const isSelected = value.includes(country);
                  return (
                    <div
                      key={country}
                      className={`flex items-center rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent ${
                        isSelected ? "bg-accent/50" : ""
                      }`}
                      onClick={() => handleSelect(country)}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{country}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-sm">No results found.</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// --- ADD PRINT HELPERS --- 
const formatDateForPrint = (dateString?: string | Date | null): string => {
  if (!dateString) return 'N/A';
  try {
    // Handle ISO strings from Firestore and Date objects
    const date = typeof dateString === 'string' ? parseISO(dateString) : (dateString instanceof Timestamp ? dateString.toDate() : dateString);
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.error("Error formatting date for print:", dateString, error);
    return 'Invalid Date';
  }
};

const formatCurrencyForPrint = (amount?: number | string | null): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) return '£N/A';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(num);
};

// --- ADD PRINTABLE COMPONENT --- 
interface PrintableReportProps {
  reportData: FormValues;
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(({ reportData }, ref) => {
  // Basic styles - can be expanded
  const printStyles: React.CSSProperties = { padding: '20mm', fontFamily: 'Arial, sans-serif', color: '#000', fontSize: '10pt' };
  const sectionStyle: React.CSSProperties = { marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #ccc' };
  const headingStyle: React.CSSProperties = { fontSize: '14pt', fontWeight: 'bold', marginBottom: '10px' };
  const subHeadingStyle: React.CSSProperties = { fontSize: '12pt', fontWeight: 'bold', marginTop: '10px', marginBottom: '5px' };
  const paraStyle: React.CSSProperties = { marginBottom: '5px', lineHeight: '1.4' };
  const strongStyle: React.CSSProperties = { fontWeight: 'bold' };

  // Helper to render outcome sections cleanly
  const renderOutcomeSection = (outcomeNum: 1 | 2 | 3) => {
    const qualitative = reportData[`outcome${outcomeNum}Qualitative` as keyof FormValues] as string | undefined;
    const quantitative = reportData[`outcome${outcomeNum}Quantitative` as keyof FormValues] as string | undefined;
    const achieved = reportData[`outcome${outcomeNum}Achieved` as keyof FormValues] as string | undefined;
    const include = reportData[`includeOutcome${outcomeNum}` as keyof FormValues] as boolean | undefined;
    const includeAchieved = reportData[`includeAchievedOutcome${outcomeNum}` as keyof FormValues] as boolean | undefined;

    // Only render if the outcome was included OR it's outcome 1
    if (outcomeNum === 1 || include) {
      return (
        <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Outcome {outcomeNum}</h2>
          {qualitative && <p style={paraStyle}><strong style={strongStyle}>Expected Qualitative:</strong> {qualitative}</p>}
          {quantitative && <p style={paraStyle}><strong style={strongStyle}>Expected Quantitative:</strong> {quantitative}</p>}
          {(includeAchieved || achieved) && <p style={paraStyle}><strong style={strongStyle}>Achieved:</strong> {achieved || 'N/A'}</p>} 
          {/* Add achieved funding details, images, story etc. here if needed */}
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={ref} style={printStyles}>
      <h1 style={headingStyle}>Impact Report: {reportData.projectName || 'N/A'}</h1>
      <p style={paraStyle}><strong style={strongStyle}>Charity:</strong> {reportData.organizationName || 'N/A'}</p>
      <p style={paraStyle}><strong style={strongStyle}>Funding Amount:</strong> {formatCurrencyForPrint(reportData.totalFundingAmount)}</p>
      <p style={paraStyle}><strong style={strongStyle}>Funding Date:</strong> {formatDateForPrint(reportData.dateFundingStarted)}</p>
      <p style={paraStyle}><strong style={strongStyle}>Report Submitted:</strong> {formatDateForPrint(reportData.dateImpactReportSubmitted)}</p>
      
      <div style={sectionStyle}>
        <h2 style={subHeadingStyle}>Project Summary</h2>
        <p style={paraStyle}>{reportData.projectSummary || 'N/A'}</p>
      </div>

      {/* Render Outcome sections */} 
      {renderOutcomeSection(1)}
      {renderOutcomeSection(2)}
      {renderOutcomeSection(3)}

      {/* Add Beneficiary Details section */}
      <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Beneficiary Details</h2>
          <p style={paraStyle}><strong style={strongStyle}>Direct Beneficiaries:</strong> {reportData.directBeneficiaries ?? 'N/A'}</p>
          <p style={paraStyle}><strong style={strongStyle}>Indirect Beneficiaries:</strong> {reportData.indirectBeneficiaries ?? 'N/A'}</p>
          {/* Add more beneficiary breakdown if needed */}
      </div>

      {/* Add Contact Details section */}
       <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Contact Details</h2>
          <p style={paraStyle}><strong style={strongStyle}>Name:</strong> {reportData.contactName || 'N/A'}</p>
          <p style={paraStyle}><strong style={strongStyle}>Position:</strong> {reportData.position || 'N/A'}</p>
          <p style={paraStyle}><strong style={strongStyle}>Email:</strong> {reportData.email || 'N/A'}</p>
          <p style={paraStyle}><strong style={strongStyle}>Telephone:</strong> {reportData.telephone || 'N/A'}</p>
       </div>

      <div style={{ ...sectionStyle, borderTop: 'none', marginTop: '30px', textAlign: 'center', fontSize: '8pt', color: '#666' }}>
        Generated from Impact Engine
      </div>
    </div>
  );
});
PrintableReport.displayName = 'PrintableReport';
// --- END PRINTABLE COMPONENT ---

export default function ImpactReportPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [contractFileURL, setContractFileURL] = useState<string | null>(null);
  const [isEarlySubmission, setIsEarlySubmission] = useState(false);
  const [dueDateFormatted, setDueDateFormatted] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [rejectionCommentToDisplay, setRejectionCommentToDisplay] = useState<string | null>(null); // New state for rejection comment

  const projectId = params.id;
  const charityName = searchParams ? searchParams.get("charity") || "" : "";
  const charityRegNumber = searchParams
    ? searchParams.get("regNumber") || ""
    : "";
  const earlySubmission = searchParams
    ? searchParams.get("early") === "true"
    : false;

  // Ref for printable component
  const printableRef = useRef<HTMLDivElement>(null);

  // Initialize form with additional fields
  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: charityName,
      charityRegistrationNumber: charityRegNumber,
      totalFundingAmount: 0,
      partnershipInvolvement: 0,
      telephone: "+44 ",
      projectCountry: [], // Initialize as empty array
      hasPartners: false,
      // Initialize outcome fields
      outcome1Qualitative: "",
      outcome1Quantitative: "",
      priorityObjective: "",
      coverageObjective: "",
      includeOutcome2: false,
      includeOutcome3: false,
      // Initialize achieved outcomes fields
      outcome1Achieved: "",
      outcome1FundingPlanned: 0,
      outcome1FundingSpent: 0,
      outcome1DifferenceReason: "",
      outcome1SurplusPlans: "",
      outcome1AmountLeftOver: 0,
      includeAchievedOutcome2: false,
      outcome2Achieved: "",
      outcome2FundingPlanned: 0,
      outcome2FundingSpent: 0,
      outcome2DifferenceReason: "",
      outcome2SurplusPlans: "",
      outcome2AmountLeftOver: 0,
      // Initialize Outcome Benefit Analysis fields
      directBeneficiaries: 0,
      indirectBeneficiaries: 0,
      maleBeneficiaries: 0,
      femaleBeneficiaries: 0,
      maleIndirectBeneficiaries: 0,
      femaleIndirectBeneficiaries: 0,
      under18Beneficiaries: 0,
      age18to34Beneficiaries: 0,
      age35to54Beneficiaries: 0,
      over55Beneficiaries: 0,
      under18IndirectBeneficiaries: 0,
      age18to34IndirectBeneficiaries: 0,
      age35to54IndirectBeneficiaries: 0,
      over55IndirectBeneficiaries: 0,
      // Geographic breakdown fields - REMOVED OLD, ADD NEW
      geographyBreakdown: [],
      // Initialize image arrays
      outcome1Images: [],
      outcome2Images: [],
      outcome3Images: [],
      locality: "",
      region: "",
      city: "",
      postcode: "",
    },
  });

  // --- MODIFY PRINT HOOK SETUP --- 
  const handlePrint = useReactToPrint({
    contentRef: printableRef,
    documentTitle: `${form.getValues("projectName") || 'Impact'}_Report`,
    onPrintError: (error) => {
        console.error("Error printing report:", error);
        toast.error("Failed to initiate PDF download.");
    },
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none; }
      }
    `,
  });
  // --- END PRINT HOOK SETUP ---

  // Add animation effect when page is loaded
  useEffect(() => {
    // Short delay to ensure smooth animation
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Load project data and any saved/submitted report data from Firestore
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user || !projectId || !charityName) {
          console.error("fetchProjectData: Missing user, projectId, or charityName.");
          setIsLoading(false);
          return;
      }
      setIsLoading(true);
      startLoading();

      try {
        setIsEarlySubmission(earlySubmission);
        if (searchParams && searchParams.get("dueDate")) {
          try {
            const dueDate = new Date(searchParams.get("dueDate") as string);
            setDueDateFormatted(format(dueDate, "MMM d, yyyy"));
          } catch (error) {
            console.error("Error formatting due date:", error);
          }
        }

        const projectDocRef = doc(db, "charities", charityName, "projects", projectId);
        const docSnap = await getDoc(projectDocRef);

        if (docSnap.exists()) {
          const projectDbData = docSnap.data();
          const status = projectDbData.impactReportStatus || 'not-started';
          const reportDataFromDb = projectDbData.impactReport || {}; // Saved report-specific data
          const dbRejectionComment = projectDbData.rejectionComment || null;

          setProjectData({
            id: projectId,
            name: projectDbData.projectName || `Project ${projectId}`,
          });

          let currentReportData: Partial<FormValues> = {}; 

          if (status === 'submitted' || status === 'approved') {
            setIsViewMode(true);
            setRejectionCommentToDisplay(null);
            currentReportData = { ...reportDataFromDb };
          } else if (status === 'draft' || status === 'rejected') {
            setIsViewMode(false);
            if (status === 'rejected' && dbRejectionComment) {
              setRejectionCommentToDisplay(dbRejectionComment);
            } else {
              setRejectionCommentToDisplay(null);
            }
            currentReportData = { ...reportDataFromDb };
          } else { // 'not-started' or other
            setIsViewMode(false);
            // For a new report, some fields might default or come from projectDbData
            currentReportData = {
               telephone: "+44 ", 
               projectCountry: projectDbData.projectCountry || [], 
               // Let Zod defaults handle most, but override with master project data below
            };
          }

          const preparedFormData = {
            ...form.formState.defaultValues, // Start with Zod defaults
            ...currentReportData,             // Overlay with report-specific data (draft/submitted)
            
            // --- Ensure master project data overrides --- 
            organizationName: charityName || projectDbData.charityName || '',
            charityRegistrationNumber: charityRegNumber || projectDbData.charityRegistrationNumber || '',
            projectName: projectDbData.projectName || currentReportData.projectName || '',
            totalFundingAmount: projectDbData.fundingAmount !== undefined ? projectDbData.fundingAmount : (currentReportData.totalFundingAmount || 0),
            
            // **** THIS IS THE KEY CHANGE FOR dateFundingStarted ****
            dateFundingStarted: projectDbData.dateFundingGiven instanceof Timestamp
                ? projectDbData.dateFundingGiven.toDate()
                : (projectDbData.dateFundingGiven && typeof projectDbData.dateFundingGiven === 'string'
                    ? new Date(projectDbData.dateFundingGiven)
                    : undefined),

            // dateImpactReportSubmitted should come from currentReportData or be new if not set
            dateImpactReportSubmitted: currentReportData.dateImpactReportSubmitted instanceof Timestamp
                ? currentReportData.dateImpactReportSubmitted.toDate()
                : (currentReportData.dateImpactReportSubmitted && typeof currentReportData.dateImpactReportSubmitted === 'string'
                    ? new Date(currentReportData.dateImpactReportSubmitted)
                    : new Date()),
            
            projectCountry: Array.isArray(currentReportData.projectCountry) && currentReportData.projectCountry.length > 0 
                ? currentReportData.projectCountry 
                : (projectDbData.projectCountry || []),
            
            priorityObjective: projectDbData.priorityObjective || currentReportData.priorityObjective || '',
            coverageObjective: projectDbData.coverageObjective || currentReportData.coverageObjective || '',
            projectSummary: projectDbData.projectSummary || currentReportData.projectSummary || '',

            // Ensure other arrays are initialized properly if they might be undefined in currentReportData
            detailedEthnicities: Array.isArray(currentReportData.detailedEthnicities) ? currentReportData.detailedEthnicities : [],
            geographyBreakdown: Array.isArray(currentReportData.geographyBreakdown) ? currentReportData.geographyBreakdown : [],
            outcome1Images: Array.isArray(currentReportData.outcome1Images) ? currentReportData.outcome1Images : [],
            outcome2Images: Array.isArray(currentReportData.outcome2Images) ? currentReportData.outcome2Images : [],
            outcome3Images: Array.isArray(currentReportData.outcome3Images) ? currentReportData.outcome3Images : [],
            partnerContract: currentReportData.partnerContract, // This comes from the report data (uploaded file info)

          } as FormValues;

          if (preparedFormData.partnerContract?.url) {
               setContractFileURL(preparedFormData.partnerContract.url);
          }

          form.reset(preparedFormData);

          if (earlySubmission && !form.getValues("dateImpactReportSubmitted")) {
              form.setValue("dateImpactReportSubmitted", new Date());
          }

        } else {
          console.error(`fetchProjectData: Project document not found at charities/${charityName}/projects/${projectId}`);
          toast.error("Project data not found.");
        }
      } catch (error) {
        console.error("Error fetching project data from Firestore:", error);
        toast.error("Failed to load project data.");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          stopLoading();
        }, 300);
      }
    };

    fetchProjectData();

  }, [user, projectId, charityName, charityRegNumber, earlySubmission, searchParams, form, startLoading, stopLoading]);

  // Check if contract is required whenever partnership involvement changes
  useEffect(() => {
    const hasPartners = form.watch("hasPartners");
    const involvement = form.watch("partnershipInvolvement");
    
    // Ensure involvement is treated as a number before checking
    const involvementPercentage = involvement === undefined || involvement === null ? -1 : Number(involvement);
    
    setContractFileURL(hasPartners && involvementPercentage >= 50 ? contractFileURL : null);
  }, [form, contractFileURL]);

  // Function to save draft progress to Firestore
  const saveProgress = async (data: FormValues) => {
    // Ensure required IDs are present
    if (!user || !projectId || !charityName) {
      toast.error("Cannot save progress: Missing user, project, or charity information.");
      console.error("Save Progress Error: Missing user, projectId, or charityName.", { userId: user?.uid, projectId, charityName });
      return;
    }

    // Prevent concurrent saves
    if (isSaving) {
        console.log("Save already in progress...");
        return;
    }
    setIsSaving(true); // Set saving state
    startLoading(); // Start global loading indicator

    console.log("Attempting to save draft for project:", projectId);

    try {
      // Prepare the data object
      const reportDataToSave: Partial<FirestoreReportData> = {
        ...data, // Spread all current form data
        // Always convert Dates to ISO strings for Firestore
        dateFundingStarted: data.dateFundingStarted instanceof Date
          ? data.dateFundingStarted.toISOString()
          : null,
        dateImpactReportSubmitted: data.dateImpactReportSubmitted instanceof Date
          ? data.dateImpactReportSubmitted.toISOString()
          : null,
        projectCountry: Array.isArray(data.projectCountry)
          ? data.projectCountry
          : [data.projectCountry].filter(Boolean),
      };

      // Explicitly handle partnerContract
      if (!contractFileURL) {
        delete reportDataToSave.partnerContract;
      } else {
        reportDataToSave.partnerContract = {
            url: contractFileURL,
            uploadedAt: new Date().toISOString(),
            name: (data.partnerContract as { name?: string })?.name || "contract.pdf",
            fileName: (data.partnerContract as { name?: string })?.name || "contract.pdf",
        };
      }

      // Replace top-level undefined values with null for Firestore compatibility
      Object.keys(reportDataToSave).forEach(key => {
          const typedKey = key as keyof FirestoreReportData;
          if (reportDataToSave[typedKey] === undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (reportDataToSave[typedKey] as any) = null;
          }
      });

      console.log("DEBUG: Cleaned draft data for Firestore:", reportDataToSave);

      // Get Firestore document reference
      const projectDocRef = doc(db, "charities", charityName, "projects", projectId);
      console.log(`Updating Firestore draft at: charities/${charityName}/projects/${projectId}`);

      // Update Firestore document
      await updateDoc(projectDocRef, {
        impactReport: reportDataToSave,     // Save the current form data as the draft report
        impactReportStatus: 'draft',        // Set status to 'draft'
        lastUpdated: serverTimestamp()      // Update timestamp
      });

      console.log("Firestore draft saved successfully.");

      // Remove the old localStorage draft item (cleanup)
      localStorage.removeItem(`impact-report-${projectId}`);

      toast.success("Progress saved successfully!");

    } catch (error) {
      console.error("Error saving progress to Firestore:", error);
      toast.error("Failed to save progress. Please try again.");
    } finally {
      stopLoading(); // Stop global loading indicator
      setIsSaving(false); // Reset saving state
    }
  };

  // Update submit function to validate contract requirement and save to Firestore
  const onSubmit = async (data: FormValues) => {
    console.log("DEBUG: onSubmit function called", data);

    // Validate all fields before submission
    console.log("DEBUG: Calling form.trigger() for validation...");
    const isValid = await form.trigger();
    console.log(`DEBUG: form.trigger() returned: ${isValid}`);

    if (!isValid) {
      console.log("DEBUG: Validation failed. Exiting onSubmit.");
      toast.error("Please complete all required fields before submitting");
      // Ensure errors are visible - maybe scroll to first error? (Complex to implement here)
      return;
    }

    // Check if contract is required but not uploaded
    const requiresContract = form.getValues("hasPartners") && Number(form.getValues("partnershipInvolvement") || 0) >= 50;
    if (requiresContract && !contractFileURL) {
      console.log("DEBUG: Contract required but not uploaded. Exiting onSubmit.");
      toast.error("Partner contract is required for >= 50% involvement.", {
        description: "Please upload the contract file in Step 1.",
      });
      // Optionally, force navigation back to Step 1
      // setCurrentStep(0);
      return;
    }

    // Ensure required IDs are present before proceeding
    if (!user || !projectId || !charityName) {
        toast.error("Cannot submit report: Missing user, project, or charity information.");
        console.error("Submit Error: Missing user, projectId, or charityName.", { userId: user?.uid, projectId, charityName });
        return;
    }

    // Start the global loading
    console.log("DEBUG: Proceeding with submission logic...");
    startLoading();

    try {
      console.log("Form submitted:", data);

      // Prepare the data object
      const reportDataToSave: Partial<FirestoreReportData> = {
        ...data, // Spread all form data
        // Always convert Dates to ISO strings for Firestore
        dateFundingStarted: data.dateFundingStarted instanceof Date
          ? data.dateFundingStarted.toISOString()
          : null,
        dateImpactReportSubmitted: data.dateImpactReportSubmitted instanceof Date
          ? data.dateImpactReportSubmitted.toISOString()
          : new Date().toISOString(),
        projectCountry: Array.isArray(data.projectCountry)
          ? data.projectCountry
          : [data.projectCountry].filter(Boolean),
      };

      // Explicitly handle partnerContract
      if (!contractFileURL) {
        delete reportDataToSave.partnerContract;
      } else {
          reportDataToSave.partnerContract = {
              url: contractFileURL,
              uploadedAt: new Date().toISOString(),
              name: (data.partnerContract as { name?: string })?.name || "contract.pdf",
              fileName: (data.partnerContract as { name?: string })?.name || "contract.pdf",
          };
      }

      // Replace top-level undefined values with null for Firestore compatibility
      Object.keys(reportDataToSave).forEach(key => {
          const typedKey = key as keyof FirestoreReportData;
          if (reportDataToSave[typedKey] === undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (reportDataToSave[typedKey] as any) = null;
          }
      });

      console.log("DEBUG: Cleaned report data for Firestore:", reportDataToSave);

      // --- Firestore Update ---
      const projectDocRef = doc(db, "charities", charityName, "projects", projectId);
      console.log(`Updating Firestore document at: charities/${charityName}/projects/${projectId}`);

      await updateDoc(projectDocRef, {
        impactReport: reportDataToSave,     // Save the complete report data
        impactReportStatus: 'submitted',    // Set status to submitted
        lastUpdated: serverTimestamp()      // Update timestamp
      });

      console.log("Firestore document successfully updated.");
      // --- End Firestore Update ---

      // Remove localStorage items (if they were ever used - good practice to clean up)
      localStorage.removeItem(`impact-report-${projectId}-submitted`); // Remove old submitted storage if exists
      localStorage.removeItem(`impact-report-${projectId}`); // Remove draft storage

      toast.success("Report submitted successfully!");

      // Short delay for the notification to be visible
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("DEBUG: Redirecting to /charity...");
      router.push("/charity"); // Redirect back to projects page

    } catch (error) {
      console.error("Error submitting report to Firestore:", error);
      console.log("DEBUG: Error occurred during submission.", error);
      toast.error("Failed to submit report. Please try again.");
      stopLoading(); // Stop loading on error
    }
    // Note: stopLoading() is called implicitly on successful navigation or in catch block
  };

  // Add an error handler for react-hook-form validation failures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (errors: any) => {
    console.error("DEBUG: Form validation failed:", errors);
    toast.error("Validation failed. Please check the form for errors.", {
      description: "Scroll up to find fields marked with errors.",
    });
  };

  // Handle navigation with loading state
  const handleNavigateBack = () => {
    startLoading();
    router.push("/charity");
  };

  // Update navigation between steps
  const nextStep = () => {
    // Fields to validate depend on current step
    let fieldsToValidate: Array<keyof FormValues> = [];
    
    if (currentStep === 0) {
      // Step 1 fields (Project Details)
      fieldsToValidate = [
        "organizationName", 
        "charityRegistrationNumber", 
        "totalFundingAmount", 
        "dateFundingStarted", 
        "priorityObjective",
        "coverageObjective",
        "projectName", 
        "projectSummary", 
        "projectCountry",
        "hasPartners"
      ];
      
      // Add partner fields if hasPartners is true
      if (form.getValues("hasPartners")) {
        fieldsToValidate.push("partnerOrganizations", "partnershipInvolvement");
      }
      
      // Add contact fields
      fieldsToValidate.push("contactName", "position", "email", "telephone", "dateImpactReportSubmitted");
    } else if (currentStep === 1) {
      // Step 2 fields (Expected Outcomes)
      fieldsToValidate = [
        "outcome1Qualitative",
        "outcome1Quantitative"
      ];
      
      // Add outcome 2 fields if included
      if (form.getValues("includeOutcome2")) {
        fieldsToValidate.push("outcome2Qualitative", "outcome2Quantitative");
      }
      
      // Add outcome 3 fields if included
      if (form.getValues("includeOutcome3")) {
        fieldsToValidate.push("outcome3Qualitative", "outcome3Quantitative");
      }
    } else if (currentStep === 2) {
      // Step 3 fields (Achieved Outcomes)
      // Remove calculated fields (AmountLeftOver) from direct validation
      fieldsToValidate = [
        "outcome1Achieved",
        "outcome1FundingPlanned",
        "outcome1FundingSpent",
        "outcome1DifferenceReason",
        "outcome1SurplusPlans",
        // "outcome1AmountLeftOver", // Removed
        "includeAchievedOutcome2",
        // Add outcome 2 fields if included
      ];
      if (form.getValues("includeAchievedOutcome2")) {
          fieldsToValidate.push(
            "outcome2Achieved",
            "outcome2FundingPlanned",
            "outcome2FundingSpent",
            "outcome2DifferenceReason",
            "outcome2SurplusPlans"
            // "outcome2AmountLeftOver" // Removed
          );
      }
      // Add outcome 3 fields if included (assuming similar structure)
      if (form.getValues("includeOutcome3")) { // Check if includeOutcome3 exists
          fieldsToValidate.push(
            "outcome3Achieved",
            "outcome3FundingPlanned",
            "outcome3FundingSpent",
            "outcome3DifferenceReason",
            "outcome3SurplusPlans"
            // "outcome3AmountLeftOver" // Removed (assuming)
           );
      }
    } else if (currentStep === 3) {
      // Step 4 fields (Outcome Benefit Analysis) - including Geography Breakdown
      fieldsToValidate = [
        "directBeneficiaries",
        "indirectBeneficiaries",
        // Add Geography Breakdown fields - REMOVED OLD
        // Zod schema handles internal validation of the geographyBreakdown array items.
        // We only need to include the main field in the list to trigger its validation if needed.
        // (Commented out as explicit validation trigger might not be needed here)
        // if (form.getValues("geographyBreakdown") && form.getValues("geographyBreakdown").length > 0) {
        //   fieldsToValidate.push("geographyBreakdown");
        // }
      ];
      
      // These fields are optional but if values are provided, validate them
      if (form.getValues("maleBeneficiaries") > 0 || form.getValues("femaleBeneficiaries") > 0) {
        fieldsToValidate.push("maleBeneficiaries", "femaleBeneficiaries");
      }
      
      if (form.getValues("under18Beneficiaries") > 0 || form.getValues("age18to34Beneficiaries") > 0 || 
          form.getValues("age35to54Beneficiaries") > 0 || form.getValues("over55Beneficiaries") > 0) {
        fieldsToValidate.push("under18Beneficiaries", "age18to34Beneficiaries", "age35to54Beneficiaries", "over55Beneficiaries");
      }
    }
    
    // Only validate the fields in the current step
    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, 3));
      } else {
        // Display error toast for invalid fields
        toast.error("Please complete all required fields before proceeding");
      }
    });
  };
  
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Fix the function signature to match the ProjectDetailsStep interface
  // Use eslint-disable to suppress the unused parameter warning
  const handleContractChange = (
    url: string | null, 
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    file: File | null
  ) => {
    // In the parent component, we only need to track the URL
    setContractFileURL(url);
    // The file parameter is only needed in the ProjectDetailsStep component
  };

  if (!user || isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <Card
          className={`max-w-4xl mx-auto ${isViewMode ? "border-green-500" : rejectionCommentToDisplay ? "border-yellow-500" : ""} 
                     transition-all duration-500 ease-in-out 
                     ${
                       pageLoaded
                         ? "opacity-100 scale-100"
                         : "opacity-0 scale-95"
                     }`}
        >
          <CardHeader
            className={`p-2 ${
              isViewMode ? "bg-green-50" : isEarlySubmission ? "bg-blue-50" : rejectionCommentToDisplay ? "bg-yellow-50" : ""
            }`}
          >
            <CardTitle className="flex items-center">
              {isViewMode ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Impact Report
                </>
              ) : rejectionCommentToDisplay ? (
                <>
                  <InfoIcon className="mr-2 h-5 w-5 text-yellow-600" /> {/* Or MessageSquareWarning */} 
                  Revise Impact Report
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Submit Impact Report
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isViewMode
                ? "This impact report has been submitted successfully."
                : rejectionCommentToDisplay 
                ? "Please address the feedback below and resubmit your report."
                : ``}
            </CardDescription>

            {/* Form step indicator */}
            {!isViewMode && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <div
                    className={`flex-1 text-center pb-2 border-b-2 ${
                      currentStep === 0
                        ? "border-primary font-medium"
                        : "border-gray-200"
                    }`}
                    onClick={() => setCurrentStep(0)}
                    role="button"
                    tabIndex={0}
                  >
                    Project Details
                  </div>
                  <div
                    className={`flex-1 text-center pb-2 border-b-2 ${
                      currentStep === 1
                        ? "border-primary font-medium"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      if (currentStep === 0) {
                        nextStep();
                      } else {
                        setCurrentStep(1);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Expected Outcomes
                  </div>
                  <div
                    className={`flex-1 text-center pb-2 border-b-2 ${
                      currentStep === 2
                        ? "border-primary font-medium"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      if (currentStep < 2) {
                        // First validate current step before moving to step 3
                        nextStep();
                      } else {
                        setCurrentStep(2);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Achieved Outcomes
                  </div>
                  <div
                    className={`flex-1 text-center pb-2 border-b-2 ${
                      currentStep === 3
                        ? "border-primary font-medium"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      if (currentStep < 3) {
                        // First validate current step before moving to step 4
                        nextStep();
                      } else {
                        setCurrentStep(3);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Outcome Analysis
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {rejectionCommentToDisplay && !isViewMode && (
              <Alert variant="default" className="mb-6 border-yellow-400 bg-yellow-50 text-yellow-800">
                <InfoIcon className="h-5 w-5 text-yellow-600" />
                <AlertTitle className="font-semibold text-yellow-700">Feedback from Mercy Mission</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {rejectionCommentToDisplay}
                </AlertDescription>
              </Alert>
            )}
            {isEarlySubmission && (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-4 border border-blue-200">
                <div className="flex items-center">
                  <CalendarIconOutline className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-medium">
                    Early Impact Report Submission
                  </h3>
                </div>
                <p className="mt-1 text-sm">
                  You&apos;re submitting this report before the due date (
                  {projectData?.name ? dueDateFormatted : "scheduled date"}).
                  Early submissions help us process funding impact more
                  efficiently. Thank you for your proactive reporting!
                </p>
              </div>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-6"
              >
                {/* Project Details (Step 1) */}
                <div className={currentStep === 0 ? "block" : "hidden"}>
                  <ProjectDetailsStep
                    form={form}
                    isViewMode={isViewMode}
                    nextStep={nextStep}
                    CountrySelect={CountrySelect}
                    projectId={projectId}
                    charityName={charityName}
                    initialContractURL={contractFileURL}
                    onContractChange={handleContractChange}
                  />
                </div>

                {/* Expected Outcomes (Step 2) */}
                <div className={currentStep === 1 ? "block" : "hidden"}>
                  <ExpectedOutcomesStep
                    form={form}
                    isViewMode={isViewMode}
                    nextStep={nextStep}
                    prevStep={prevStep}
                  />
                </div>

                {/* Step 3: Achieved Outcomes */}
                <div className={currentStep === 2 ? "block" : "hidden"}>
                  <AchievedOutcomesStep
                    form={form}
                    isViewMode={isViewMode}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    totalFundingAmount={form.getValues("totalFundingAmount")}
                    charityId={charityName}
                    projectId={projectId}
                  />
                </div>
                
                {/* Step 4: Outcome Benefit Analysis */}
                <div className={currentStep === 3 ? "block" : "hidden"}>
                  <OutcomeAnalysisStep
                    form={form}
                    isViewMode={isViewMode}
                    nextStep={nextStep}
                    prevStep={prevStep}
                  />
                </div>
                
                {/* Form Actions - Only show submit on the final step or in view mode */}
                <div className="flex justify-between mt-6">
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => saveProgress(form.getValues())}
                      disabled={isSaving || isViewMode}
                    >
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <SaveIcon className="mr-2 h-4 w-4" />
                          Save Progress
                        </>
                      )}
                    </Button>
                  )}

                  <div className="space-x-2 flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNavigateBack}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {isViewMode ? "Back to Projects" : "Cancel"}
                    </Button>
                    
                    {/* ADD DOWNLOAD BUTTON - visible only in view mode */} 
                    {isViewMode && (
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={handlePrint} 
                        >
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    )}

                    {/* Submit Button - visible only in edit mode on last step */}
                    {!isViewMode && currentStep === 3 && (
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Report
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* --- ADD HIDDEN PRINTABLE COMPONENT RENDER --- */}
      {isViewMode && (
          <div style={{ display: 'none' }}>
              <PrintableReport ref={printableRef} reportData={form.getValues()} />
          </div>
      )}
      {/* --- END HIDDEN PRINTABLE COMPONENT RENDER --- */}
    </>
  );
}
