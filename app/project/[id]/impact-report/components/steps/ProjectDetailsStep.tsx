import React, { useState, useRef } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, X, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { storage } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../../page";

// Define the new objective data structure
const mercyMissionData: { [key: string]: string[] } = {
  "Direct support": [
    "Meeting basic needs such as food, shelter, hygiene",
    "Poverty relief",
    "Medical aid",
  ],
  "Social inclusion": [
    "Supporting BAME communities",
    "Supporting Muslim vulnerable communities",
    "Supporting communities to participate more fully in society",
  ],
  "Faith building": [
    "Promoting religious literacy",
    "Promoting religious harmony",
    "Capacity-building for a better civil society",
  ],
};

const priorities = Object.keys(mercyMissionData);

// Props for the component
interface ProjectDetailsStepProps {
  form: UseFormReturn<FormValues>;
  isViewMode: boolean;
  nextStep: () => void;
  CountrySelect: React.ComponentType<{
    value: string[];
    onChange: (value: string[]) => void;
    disabled?: boolean;
  }>;
  projectId: string;
  charityName: string;
  initialContractURL: string | null;
  onContractChange: (url: string | null, file: File | null) => void;
}

/**
 * Project Details Step component
 * Renders the first step of the impact report form
 */
export default function ProjectDetailsStep({
  form,
  isViewMode,
  nextStep,
  CountrySelect,
  projectId,
  charityName,
  initialContractURL,
  onContractChange,
}: ProjectDetailsStepProps) {
  // File upload state
  const [partnerContractFile, setPartnerContractFile] = useState<File | null>(
    null
  );
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contractFileURL, setContractFileURL] = useState<string | null>(
    initialContractURL
  );
  const [isUploading, setIsUploading] = useState(false);
  const [contractRequired, setContractRequired] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch the selected priority to update the coverage options
  const selectedPriority = form.watch("priorityObjective");
  const coverageOptions = selectedPriority
    ? mercyMissionData[selectedPriority]
    : [];

  // Check if contract is required whenever partnership involvement changes
  React.useEffect(() => {
    const involvement = form.watch("partnershipInvolvement");
    const hasPartners = form.watch("hasPartners");
    setContractRequired(hasPartners && (Number(involvement) || 0) >= 50);
  }, [form]);

  // Add file change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPartnerContractFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  // Add file upload function
  const uploadContractFile = async () => {
    if (!partnerContractFile) {
      console.error(
        "Upload Contract: partnerContractFile is null despite initial check."
      );
      setUploadError("File selection error. Please re-select the file.");
      return null;
    }

    setUploadError(null);
    setUploadProgress(0);

    try {
      // Re-check file inside try block for stricter type narrowing
      if (!partnerContractFile) {
        // This path should theoretically not be reached due to the check at the function start
        console.error(
          "Assertion failed: partnerContractFile is null inside try block."
        );
        throw new Error("Contract file is unexpectedly missing.");
      }
      // Assign to new constant after the check
      const fileToUpload = partnerContractFile;

      // Create a reference in Firebase Storage
      const contractRef = ref(
        storage,
        `contracts/${charityName}/${projectId}/${fileToUpload.name}` // Use the guaranteed non-null constant
      );

      // Start the upload
      const uploadTask = uploadBytesResumable(contractRef, fileToUpload); // Use the guaranteed non-null constant

      // Return a promise that resolves with the download URL
      return new Promise<string>((resolve, reject) => {
        // Monitor state changes
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            setUploadError(error.message);
            reject(error);
          },
          async () => {
            // Upload completed successfully - get the file's download URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setContractFileURL(downloadURL);
              // Notify parent component about the change
              onContractChange(downloadURL, fileToUpload);
              setUploadSuccess(true);
              setUploadProgress(100);
              resolve(downloadURL);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              setUploadError(errorMessage);
              reject(error);
            }
          }
        );
      });
    } catch (error: unknown) {
      console.error("Error setting up upload:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setUploadError(errorMessage);
      return null;
    }
  };

  // Add file upload handler function
  const handleUpload = async () => {
    if (!partnerContractFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      const fileUrl = await uploadContractFile();
      if (fileUrl) {
        toast.success("Contract uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading contract:", error);
      toast.error("Failed to upload contract");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle removing a file
  const handleRemoveFile = () => {
    setContractFileURL(null);
    setPartnerContractFile(null);
    setUploadSuccess(false);
    // Notify parent component about the change
    onContractChange(null, null);
  };

  return (
    <div>
      {/* Project Details Section */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name*</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-50" />
                </FormControl>
                <FormDescription>
                  Auto-populated from your charity profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="charityRegistrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charity Registration Number*</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-50" />
                </FormControl>
                <FormDescription>
                  Auto-populated from your charity profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalFundingAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Funding Amount (£)*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    readOnly
                    disabled={true}
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormDescription>This amount is set from the gfa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateFundingStarted"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Funding Started*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal bg-gray-50 ${
                          !field.value && "text-muted-foreground"
                        }`}
                        disabled={true}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={true}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>This date is set from the gfa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Container for side-by-side objective dropdowns */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priorityObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Objective*</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("coverageObjective", "", {
                        shouldValidate: true,
                      });
                    }}
                    value={field.value}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverageObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What this covers*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedPriority || isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select what this covers" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coverageOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Project Name - Moved to its own full-width line */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name*</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Project Summary - Remains full-width */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="projectSummary"
              render={({ field }) => {
                const text = field.value || "";
                // Basic word count: split by space, filter empty strings
                const wordCount = text
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
                return (
                  <FormItem>
                    <FormLabel>Project Summary*</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide a concise summary of the project's purpose (max 50 words)"
                        className="min-h-20"
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <FormDescription>
                        {!isViewMode && (
                          <span
                            className={wordCount > 50 ? "text-red-600" : ""}
                          >
                            Words: {wordCount} / 50
                          </span>
                        )}
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* Project Countries */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="projectCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Countries*</FormLabel>
                  <CountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isViewMode}
                  />
                  <FormDescription>
                    Select the countries where the project operates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Locality and Region */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locality*</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region*</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* City and Postcode */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City*</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Partnership Section */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">
          Project Partnership Details
        </h3>

        <FormField
          control={form.control}
          name="hasPartners"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Did you use any partners for this project?*</FormLabel>
              <FormControl>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="yes-partners"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                      disabled={isViewMode}
                    />
                    <label htmlFor="yes-partners">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="no-partners"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                      disabled={isViewMode}
                    />
                    <label htmlFor="no-partners">No</label>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("hasPartners") && (
          <div className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="partnerOrganizations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Organizations*</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="List all partner organizations involved in this project"
                      className="min-h-20"
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormDescription>
                    Include the names of all partner organizations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partnershipInvolvement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    What percentage of the project was delivered by partners?*
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(value > 100 ? 100 : value);
                        }}
                        className="w-24"
                        disabled={isViewMode}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>Enter a value between 0-100</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contract Upload Section */}
            {(Number(form.watch("partnershipInvolvement")) || 0) >= 50 && (
              <div className="space-y-4 mt-4 border-t pt-4">
                <FormItem>
                  <FormLabel>Partner Contract*</FormLabel>
                  <FormDescription>
                    As partner involvement is{" "}
                    {form.watch("partnershipInvolvement")}% or more, please
                    upload a copy of the partner contract.
                  </FormDescription>

                  <div className="space-y-4">
                    {/* Show contract info if already uploaded */}
                    {contractFileURL ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <p className="font-medium">
                              Contract uploaded successfully
                            </p>
                            <a
                              href={contractFileURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View contract
                            </a>
                          </div>
                        </div>
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          Drag and drop your file here, or click to browse
                        </p>
                        <input
                          type="file"
                          id="contract-file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                        <div className="flex space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isViewMode}
                          >
                            Select File
                          </Button>
                          {partnerContractFile && (
                            <Button
                              type="button"
                              onClick={handleUpload}
                              disabled={isViewMode || isUploading}
                            >
                              {isUploading ? "Uploading..." : "Upload Contract"}
                            </Button>
                          )}
                        </div>
                        {partnerContractFile && (
                          <p className="mt-4 text-sm">
                            Selected file: {partnerContractFile.name}
                          </p>
                        )}
                        {uploadError && (
                          <p className="mt-2 text-sm text-red-600">
                            {uploadError}
                          </p>
                        )}
                      </div>
                    )}

                    {contractRequired && !contractFileURL && !isViewMode && (
                      <p className="text-sm text-red-600">
                        * Contract is required because partner involvement is
                        50% or more
                      </p>
                    )}
                  </div>
                </FormItem>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Details */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name*</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isViewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position*</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isViewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input {...field} type="email" disabled={isViewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone*</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isViewMode} />
                </FormControl>
                <FormDescription>
                  Include country code (e.g., +44)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateImpactReportSubmitted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Impact Report Submitted*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                        disabled={isViewMode}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={isViewMode}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Next step button */}
      <div className="flex justify-between mt-6">
        <div>
          {/* Space reserved for back button (for consistent layout) */}
        </div>
        <Button type="button" onClick={nextStep}>
          Next: Expected Outcomes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
