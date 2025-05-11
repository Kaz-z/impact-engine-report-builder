import React from "react";
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
import { ArrowRight, ArrowLeft, Save, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UploadImagesForOutcome } from "./AchievedOutcomesUpload";
import Image from "next/image";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

// Interface for file metadata
interface FileMetadata {
  url: string;
  fileName?: string;
  uploadedAt?: string;
}

interface AchievedOutcomesStepProps {
  form: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    control: any;
    watch: any;
    getValues: any;
    setValue?: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };
  isViewMode: boolean;
  nextStep: () => void;
  prevStep: () => void;
  onSaveProgress?: () => void;
  totalFundingAmount: number;
  charityId: string;
  projectId: string;
}

// New Component for Calculated Amount Left Over
interface CalculatedAmountLeftOverFieldProps {
  form: AchievedOutcomesStepProps["form"];
  fieldNamePrefix: "outcome1" | "outcome2" | "outcome3";
  formatCurrency: (value: number) => string;
  isViewMode: boolean;
}

const CalculatedAmountLeftOverField: React.FC<CalculatedAmountLeftOverFieldProps> = ({ form, fieldNamePrefix, formatCurrency, isViewMode }) => {
  const plannedValue = form.watch(`${fieldNamePrefix}FundingPlanned`);
  const spentValue = form.watch(`${fieldNamePrefix}FundingSpent`);
  const amountLeftOverFieldName = `${fieldNamePrefix}AmountLeftOver`;

  const planned = parseFloat(String(plannedValue)) || 0;
  const spent = parseFloat(String(spentValue)) || 0;
  const leftOverNumber = Math.max(0, planned - spent);
  const leftOverString = isNaN(leftOverNumber) ? "0.00" : leftOverNumber.toFixed(2);

  React.useEffect(() => {
    if (!isViewMode && form.getValues(amountLeftOverFieldName) !== leftOverString) {
        if (form.setValue) {
            form.setValue(amountLeftOverFieldName, leftOverString, { shouldValidate: true, shouldDirty: true });
        }
    }
  }, [leftOverString, amountLeftOverFieldName, form, isViewMode]);

  return (
    <FormField
      control={form.control}
      name={amountLeftOverFieldName}
      render={() => (
        <FormItem>
          <FormLabel>Amount Left Over</FormLabel>
          <FormControl>
            <Input type="text" value={leftOverString} disabled={true} className="bg-muted" />
          </FormControl>
          <FormDescription>Automatically calculated ({formatCurrency(leftOverNumber)})</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// --- Component for Funding Allocation Display (with internal watch) ---
interface FundingAllocationDisplayProps {
  form: AchievedOutcomesStepProps["form"];
  totalFundingAmount: number;
  formatCurrency: (value: number) => string;
}

const FundingAllocationDisplay: React.FC<FundingAllocationDisplayProps> = ({ form, totalFundingAmount, formatCurrency }) => {
  // Watch necessary fields inside this component
  const outcome1Planned = parseFloat(String(form.watch("outcome1FundingPlanned"))) || 0;
  const outcome1Spent = parseFloat(String(form.watch("outcome1FundingSpent"))) || 0;
  const includeOutcome2 = form.watch("includeOutcome2");
  const outcome2Planned = includeOutcome2 ? (parseFloat(String(form.watch("outcome2FundingPlanned"))) || 0) : 0;
  const outcome2Spent = includeOutcome2 ? (parseFloat(String(form.watch("outcome2FundingSpent"))) || 0) : 0;
  const includeOutcome3 = form.watch("includeOutcome3");
  const outcome3Planned = includeOutcome3 ? (parseFloat(String(form.watch("outcome3FundingPlanned"))) || 0) : 0;
  const outcome3Spent = includeOutcome3 ? (parseFloat(String(form.watch("outcome3FundingSpent"))) || 0) : 0;

  // Calculations inside the component
  const totalPlannedFunding = outcome1Planned + outcome2Planned + outcome3Planned;
  const remainingToAllocate = totalFundingAmount - totalPlannedFunding;
  const outcome1Surplus = Math.max(0, outcome1Planned - outcome1Spent);
  const outcome2Surplus = includeOutcome2 ? Math.max(0, outcome2Planned - outcome2Spent) : 0;
  const outcome3Surplus = includeOutcome3 ? Math.max(0, outcome3Planned - outcome3Spent) : 0;
  const totalSurplus = outcome1Surplus + outcome2Surplus + outcome3Surplus;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 space-y-1">
      <h4 className="font-medium text-blue-800">Funding Allocation</h4>
      <p className="text-sm text-blue-700">Total Project Funding: {formatCurrency(totalFundingAmount)}</p>
      <p className="text-sm text-blue-700">Total Planned Funding: {formatCurrency(totalPlannedFunding)}</p>
      <p className="text-sm text-blue-700">Remaining to Allocate: {formatCurrency(remainingToAllocate)}</p>
      {totalPlannedFunding > totalFundingAmount && (
        <p className="text-sm text-red-600 font-medium pt-1">Warning: Total planned funding exceeds the project total.</p>
      )}
      {totalSurplus > 0 && (
        <p className="text-sm text-red-600 font-medium pt-1 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1 inline-block" />
          <span>Surplus of {formatCurrency(totalSurplus)} detected. Surplus funds must be returned.</span>
        </p>
      )}
    </div>
  );
};
// --- End FundingAllocationDisplay Component ---

export default function AchievedOutcomesStep({
  form,
  isViewMode,
  nextStep,
  prevStep,
  onSaveProgress,
  totalFundingAmount,
  charityId,
  projectId,
}: AchievedOutcomesStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
  };

  console.log("isViewMode", isViewMode);

  return (
    <div>
      <div className="md:col-span-2 space-y-6 border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Achieved Outcomes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please describe the actual outcomes that were achieved through this
          project. What evidence do you have that the outcomes were achieved,
          and what impact did they have?
        </p>

        {/* Render the Funding Allocation Display component */}
        <FundingAllocationDisplay
          form={form}
          totalFundingAmount={totalFundingAmount}
          formatCurrency={formatCurrency}
        />

        {/* Outcome 1 Achieved (Always shown) */}
        <Collapsible
          className="rounded-md p-4 space-y-4 mb-6"
          defaultOpen={true}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h4 className="font-medium text-left">Outcome 1 Results</h4>
            <div className="flex items-center text-muted-foreground">
              <span className="text-xs mr-2">
                {form.watch("includeOutcome2") || form.watch("includeOutcome3")
                  ? "Click to expand/collapse"
                  : ""}
              </span>
              <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground italic">
              {form.watch("outcome1Qualitative")}
            </p>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="outcome1Achieved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What was achieved?</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what was actually achieved"
                        className="min-h-20"
                        disabled={isViewMode}
                        maxLength={500}
                      />
                    </FormControl>
                    <FormDescription>Max 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome1FundingPlanned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Funding Planned*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const o2p = form.getValues("includeOutcome2") ? (parseFloat(String(form.getValues("outcome2FundingPlanned"))) || 0) : 0;
                          const o3p = form.getValues("includeOutcome3") ? (parseFloat(String(form.getValues("outcome3FundingPlanned"))) || 0) : 0;
                          const maxAllowed = totalFundingAmount - (o2p + o3p);
                          if (value > maxAllowed) {
                            toast.error(`Planned funding cannot exceed remaining ${formatCurrency(maxAllowed)}`);
                            field.onChange(maxAllowed);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormDescription>
                      Total planned funding cannot exceed {formatCurrency(totalFundingAmount)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome1FundingSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Funding Spent*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome1DifferenceReason"
                render={({ field }) => {
                  // Only show this field if there's a difference between planned and spent
                  const planned = Number(
                    form.getValues("outcome1FundingPlanned") || 0
                  );
                  const spent = Number(
                    form.getValues("outcome1FundingSpent") || 0
                  );
                  const hasDifference = planned !== spent;

                  return hasDifference ? (
                    <FormItem>
                      <FormLabel>Reason for Difference</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the reason for the difference between planned and actual funding"
                          className="min-h-20"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>Max 500 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <></>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="outcome1SurplusPlans"
                render={({ field }) => {
                  // Only show this field if there's a surplus (planned > spent)
                  const planned = Number(
                    form.getValues("outcome1FundingPlanned") || 0
                  );
                  const spent = Number(
                    form.getValues("outcome1FundingSpent") || 0
                  );
                  const hasSurplus = planned > spent;

                  return hasSurplus ? (
                    <FormItem>
                      <FormLabel>Surplus Plans</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe any plans for using surplus funds"
                          className="min-h-20"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>Max 500 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <></>
                  );
                }}
              />

              {/* USE NEW COMPONENT FOR OUTCOME 1 AMOUNT LEFT OVER */}
              <CalculatedAmountLeftOverField
                form={form}
                fieldNamePrefix="outcome1"
                formatCurrency={formatCurrency}
                isViewMode={isViewMode}
              />

              {/* Supporting Materials for Outcome 1 */}
              <div className="rounded-md space-y-4 mt-4">
                <h5 className="font-medium text-sm">Supporting Materials</h5>
                <p className="text-sm text-muted-foreground">
                  Add images, stories, interviews, links, or other supporting
                  materials to bring your story to life.
                </p>

                {/* Impact Story */}
                <FormField
                  control={form.control}
                  name="outcome1Story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Story</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Share a story about how this outcome changed lives. Who did you speak to, how did it impact them or their community?"
                          className="min-h-20"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                {!isViewMode && (
                  <UploadImagesForOutcome
                    charityId={charityId}
                    projectId={projectId}
                    outcomeNo={1}
                    isViewMode={isViewMode}
                    existingUrls={form.getValues("outcome1Images") || []}
                    onImagesChange={(images) => {
                      if (form.setValue && JSON.stringify(images) !== JSON.stringify(form.getValues("outcome1Images"))) {
                        form.setValue("outcome1Images", images);
                      }
                    }}
                  />
                )}

                {/* Display images in view mode */}
                {isViewMode && form.getValues("outcome1Images")?.length > 0 && (
                  <div className="space-y-2">
                    <FormLabel>Supporting Images</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {form.getValues("outcome1Images").map((file: FileMetadata | string, index: number) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                          <Image 
                            src={typeof file === 'string' ? file : file.url} 
                            alt={`Supporting image ${index + 1} for outcome 1`} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Always display preview grid of uploaded images in edit mode */}
                {!isViewMode && form.watch("outcome1Images")?.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <FormLabel>Current Uploaded Images</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {form.watch("outcome1Images").map((file: FileMetadata | string, index: number) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                          <Image 
                            src={typeof file === 'string' ? file : file.url} 
                            alt={`Supporting image ${index + 1} for outcome 1`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Links/Transcripts */}
                <FormField
                  control={form.control}
                  name="outcome1Interviews"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interviews or Testimonials</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Include quotes, transcripts, or links to videos of beneficiary testimonials"
                          className="min-h-16"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Media Links */}
                <FormField
                  control={form.control}
                  name="outcome1SocialMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media or External Links</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Add Links to social media posts, news articles, or other external content"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Outcome 2 Achieved (Conditionally shown based on Expected Outcomes) */}
        {form.watch("includeOutcome2") && (
          <Collapsible
            className="border rounded-md p-4 space-y-4 mb-6"
            defaultOpen={!form.watch("includeOutcome3")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h4 className="font-medium text-left">Outcome 2 Results</h4>
              <div className="flex items-center text-muted-foreground">
                <span className="text-xs mr-2">Click to expand/collapse</span>
                <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground italic">
                {form.watch("outcome2Qualitative")}
              </p>
              <div className="grid grid-cols-1 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="outcome2Achieved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What was achieved?</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe what was actually achieved"
                          className="min-h-20"
                          disabled={isViewMode}
                          maxLength={1000}
                        />
                      </FormControl>
                      <FormDescription>Max 1000 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome2FundingPlanned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Funding Planned*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const o1p = parseFloat(String(form.getValues("outcome1FundingPlanned"))) || 0;
                            const o3p = form.getValues("includeOutcome3") ? (parseFloat(String(form.getValues("outcome3FundingPlanned"))) || 0) : 0;
                            const maxAllowed = totalFundingAmount - (o1p + o3p);
                            if (value > maxAllowed) {
                              toast.error(`Planned funding cannot exceed remaining ${formatCurrency(maxAllowed)}`);
                              field.onChange(maxAllowed);
                            } else {
                              field.onChange(value);
                            }
                          }}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>
                        Total planned funding cannot exceed {formatCurrency(totalFundingAmount)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome2FundingSpent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Funding Spent*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome2DifferenceReason"
                  render={({ field }) => {
                    // Only show this field if there's a difference between planned and spent
                    const planned = Number(
                      form.getValues("outcome2FundingPlanned") || 0
                    );
                    const spent = Number(
                      form.getValues("outcome2FundingSpent") || 0
                    );
                    const hasDifference = planned !== spent;

                    return hasDifference ? (
                      <FormItem>
                        <FormLabel>Reason for Difference</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the reason for the difference between planned and actual funding"
                            className="min-h-20"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormDescription>Max 500 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    ) : (
                      <></>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="outcome2SurplusPlans"
                  render={({ field }) => {
                    // Only show this field if there's a surplus (planned > spent)
                    const planned = Number(
                      form.getValues("outcome2FundingPlanned") || 0
                    );
                    const spent = Number(
                      form.getValues("outcome2FundingSpent") || 0
                    );
                    const hasSurplus = planned > spent;

                    return hasSurplus ? (
                      <FormItem>
                        <FormLabel>Surplus Plans</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe any plans for using surplus funds"
                            className="min-h-20"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormDescription>Max 500 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    ) : (
                      <></>
                    );
                  }}
                />

                {/* USE NEW COMPONENT FOR OUTCOME 2 AMOUNT LEFT OVER */}
                <CalculatedAmountLeftOverField
                  form={form}
                  fieldNamePrefix="outcome2"
                  formatCurrency={formatCurrency}
                  isViewMode={isViewMode}
                />

                {/* Supporting Materials for Outcome 2 */}
                <div className="rounded-md space-y-4 mt-4">
                  <h5 className="font-medium text-sm">Supporting Materials</h5>
                  <p className="text-sm text-muted-foreground">
                    Add images, stories, interviews, links, or other supporting
                    materials to bring your outcome to life.
                  </p>

                  {/* Impact Story */}
                  <FormField
                    control={form.control}
                    name="outcome2Story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact Story</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share a story about how this outcome changed lives. Who did you speak to, how did it impact them or their community?"
                            className="min-h-20"
                            disabled={isViewMode}
                            maxLength={1500}
                          />
                        </FormControl>
                        <FormDescription>Max 1500 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  {!isViewMode && (
                    <UploadImagesForOutcome
                      charityId={charityId}
                      projectId={projectId}
                      outcomeNo={2}
                      isViewMode={isViewMode}
                      existingUrls={form.getValues("outcome2Images") || []}
                      onImagesChange={(images) => {
                        if (form.setValue && JSON.stringify(images) !== JSON.stringify(form.getValues("outcome2Images"))) {
                          form.setValue("outcome2Images", images);
                        }
                      }}
                    />
                  )}

                  {/* Display images in view mode */}
                  {isViewMode && form.getValues("outcome2Images")?.length > 0 && (
                    <div className="space-y-2">
                      <FormLabel>Supporting Images</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {form.getValues("outcome2Images").map((file: FileMetadata | string, index: number) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                            <Image 
                              src={typeof file === 'string' ? file : file.url} 
                              alt={`Supporting image ${index + 1} for outcome 2`} 
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Always display preview grid of uploaded images in edit mode */}
                  {!isViewMode && form.watch("outcome2Images")?.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <FormLabel>Current Uploaded Images</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {form.watch("outcome2Images").map((file: FileMetadata | string, index: number) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                            <Image 
                              src={typeof file === 'string' ? file : file.url} 
                              alt={`Supporting image ${index + 1} for outcome 2`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Links/Transcripts */}
                  <FormField
                    control={form.control}
                    name="outcome2Interviews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interviews or Testimonials</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Include quotes, transcripts, or links to videos of beneficiary testimonials"
                            className="min-h-16"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Social Media Links */}
                  <FormField
                    control={form.control}
                    name="outcome2SocialMedia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media or External Links</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Links to social media posts, news articles, or other external content"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Outcome 3 Achieved (Conditionally shown based on Expected Outcomes) */}
        {form.watch("includeOutcome3") && (
          <Collapsible
            className="border rounded-md p-4 space-y-4 mb-6"
            defaultOpen={false}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h4 className="font-medium text-left">Outcome 3 Results</h4>
              <div className="flex items-center text-muted-foreground">
                <span className="text-xs mr-2">Click to expand/collapse</span>
                <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground italic">
                {form.watch("outcome3Qualitative")}
              </p>
              <div className="grid grid-cols-1 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="outcome3Achieved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What was achieved?</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe what was actually achieved"
                          className="min-h-20"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>Max 500 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome3FundingPlanned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Funding Planned*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const o1p = parseFloat(String(form.getValues("outcome1FundingPlanned"))) || 0;
                            const o2p = form.getValues("includeOutcome2") ? (parseFloat(String(form.getValues("outcome2FundingPlanned"))) || 0) : 0;
                            const maxAllowed = totalFundingAmount - (o1p + o2p);
                            if (value > maxAllowed) {
                              toast.error(`Planned funding cannot exceed remaining ${formatCurrency(maxAllowed)}`);
                              field.onChange(maxAllowed);
                            } else {
                              field.onChange(value);
                            }
                          }}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>
                        Total planned funding cannot exceed {formatCurrency(totalFundingAmount)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome3FundingSpent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Funding Spent*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome3DifferenceReason"
                  render={({ field }) => {
                    // Only show this field if there's a difference between planned and spent
                    const planned = Number(
                      form.getValues("outcome3FundingPlanned") || 0
                    );
                    const spent = Number(
                      form.getValues("outcome3FundingSpent") || 0
                    );
                    const hasDifference = planned !== spent;

                    return hasDifference ? (
                      <FormItem>
                        <FormLabel>Reason for Difference</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the reason for the difference between planned and actual funding"
                            className="min-h-20"
                            disabled={isViewMode}
                            maxLength={500}
                          />
                        </FormControl>
                        <FormDescription>Max 500 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    ) : (
                      <></>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="outcome3SurplusPlans"
                  render={({ field }) => {
                    // Only show this field if there's a surplus (planned > spent)
                    const planned = Number(
                      form.getValues("outcome3FundingPlanned") || 0
                    );
                    const spent = Number(
                      form.getValues("outcome3FundingSpent") || 0
                    );
                    const hasSurplus = planned > spent;

                    return hasSurplus ? (
                      <FormItem>
                        <FormLabel>Surplus Plans</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe any plans for using surplus funds"
                            className="min-h-20"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormDescription>Max 500 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    ) : (
                      <></>
                    );
                  }}
                />

                {/* USE NEW COMPONENT FOR OUTCOME 3 AMOUNT LEFT OVER */}
                <CalculatedAmountLeftOverField
                  form={form}
                  fieldNamePrefix="outcome3"
                  formatCurrency={formatCurrency}
                  isViewMode={isViewMode}
                />

                {/* Supporting Materials for Outcome 3 */}
                <div className="rounded-md p-4 bg-muted/30 space-y-4 mt-4">
                  <h5 className="font-medium text-sm">Supporting Materials</h5>
                  <p className="text-sm text-muted-foreground">
                    Add images, stories, interviews, links, or other supporting
                    materials to bring your story to life.
                  </p>

                  {/* Impact Story */}
                  <FormField
                    control={form.control}
                    name="outcome3Story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact Story</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share a story about how this outcome changed lives. Who did you speak to, how did it impact them or their community?"
                            className="min-h-20"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  {!isViewMode && (
                    <UploadImagesForOutcome
                      charityId={charityId}
                      projectId={projectId}
                      outcomeNo={3}
                      isViewMode={isViewMode}
                      existingUrls={form.getValues("outcome3Images") || []}
                      onImagesChange={(images) => {
                        if (form.setValue && JSON.stringify(images) !== JSON.stringify(form.getValues("outcome3Images"))) {
                          form.setValue("outcome3Images", images);
                        }
                      }}
                    />
                  )}

                  {/* Display images in view mode */}
                  {isViewMode && form.getValues("outcome3Images")?.length > 0 && (
                    <div className="space-y-2">
                      <FormLabel>Supporting Images</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {form.getValues("outcome3Images").map((file: FileMetadata | string, index: number) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                            <Image 
                              src={typeof file === 'string' ? file : file.url} 
                              alt={`Supporting image ${index + 1} for outcome 3`} 
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Always display preview grid of uploaded images in edit mode */}
                  {!isViewMode && form.watch("outcome3Images")?.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <FormLabel>Current Uploaded Images</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {form.watch("outcome3Images").map((file: FileMetadata | string, index: number) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                            <Image 
                              src={typeof file === 'string' ? file : file.url} 
                              alt={`Supporting image ${index + 1} for outcome 3`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Links/Transcripts */}
                  <FormField
                    control={form.control}
                    name="outcome3Interviews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interviews or Testimonials</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Include interview transcripts or links to video interviews"
                            className="min-h-16"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Social Media Links */}
                  <FormField
                    control={form.control}
                    name="outcome3SocialMedia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media or External Links</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Links to social media posts, news articles, or other external content"
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Expected Outcomes
        </Button>

        <div className="flex space-x-2">
          {!isViewMode && onSaveProgress && (
            <Button type="button" onClick={onSaveProgress} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
          )}

          <Button type="button" onClick={nextStep}>
            Next: Outcome Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
