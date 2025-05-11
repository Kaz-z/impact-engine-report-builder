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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EthnicityMultiSelect, ethnicities } from "../EthnicityMultiSelect";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Trash2 } from "lucide-react";

// We use a generic form type to accommodate the complex FormValues type from the parent component
interface OutcomeAnalysisStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isViewMode: boolean;
  prevStep: () => void;
  nextStep: () => void;
  onSubmit?: () => void;
  onSaveProgress?: () => void;
}

export default function OutcomeAnalysisStep({
  form,
  isViewMode,
  prevStep,
}: OutcomeAnalysisStepProps) {
  // Setup useFieldArray for geographyBreakdown
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "geographyBreakdown",
  });

  // Calculate total beneficiaries from the dynamic list
  const calculateTotalGeography = (type: 'directBeneficiaries' | 'indirectBeneficiaries') => {
    return fields.reduce((sum, item, index) => {
      const value = form.watch(`geographyBreakdown.${index}.${type}`);
      return sum + (Number(value) || 0);
    }, 0);
  };

  const totalDirectGeography = calculateTotalGeography('directBeneficiaries');
  const totalIndirectGeography = calculateTotalGeography('indirectBeneficiaries');

  return (
    <div>
      {/* Beneficiary Numbers */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Beneficiary Analysis</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted text-left w-1/3">Beneficiary Type</th>
                <th className="border p-2 bg-muted text-center">Count</th>
                <th className="border p-2 bg-muted text-center">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Direct Beneficiaries</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="directBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-sm">
                  Number of people directly benefiting from the project
                </td>
              </tr>
              <tr>
                <td className="border p-2">Indirect Beneficiaries</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="indirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-sm">
                  Number of people indirectly benefiting from the project
                </td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border p-2 font-medium">Total</td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("directBeneficiaries") || 0) + (form.watch("indirectBeneficiaries") || 0)}
                </td>
                <td className="border p-2 text-sm">
                  Total number of people impacted by the project
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gender Breakdown */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Gender Breakdown</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted text-left w-1/3">Gender</th>
                <th className="border p-2 bg-muted text-center">Direct Beneficiaries</th>
                <th className="border p-2 bg-muted text-center">Indirect Beneficiaries</th>
                <th className="border p-2 bg-muted text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Male</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="maleBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="maleIndirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  {(form.watch("maleBeneficiaries") || 0) + (form.watch("maleIndirectBeneficiaries") || 0)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Female</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="femaleBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="femaleIndirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  {(form.watch("femaleBeneficiaries") || 0) + (form.watch("femaleIndirectBeneficiaries") || 0)}
                </td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border p-2 font-medium">Total</td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("maleBeneficiaries") || 0) + (form.watch("femaleBeneficiaries") || 0)}
                </td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("maleIndirectBeneficiaries") || 0) + (form.watch("femaleIndirectBeneficiaries") || 0)}
                </td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("maleBeneficiaries") || 0) + 
                   (form.watch("femaleBeneficiaries") || 0) +
                   (form.watch("maleIndirectBeneficiaries") || 0) + 
                   (form.watch("femaleIndirectBeneficiaries") || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Gender balance verification */}
        {form.watch("maleBeneficiaries") + form.watch("femaleBeneficiaries") > 0 && 
         form.watch("maleBeneficiaries") + form.watch("femaleBeneficiaries") !== form.watch("directBeneficiaries") && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
            <p className="text-yellow-800">
              Note: The sum of male and female beneficiaries ({form.watch("maleBeneficiaries") + form.watch("femaleBeneficiaries")}) 
              does not match the total direct beneficiaries ({form.watch("directBeneficiaries")}).
            </p>
          </div>
        )}
      </div>

      {/* Age Breakdown */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Age Breakdown</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted text-left w-1/3">Age Group</th>
                <th className="border p-2 bg-muted text-center">Direct Beneficiaries</th>
                <th className="border p-2 bg-muted text-center">Indirect Beneficiaries</th>
                <th className="border p-2 bg-muted text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Under 18</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="under18Beneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="under18IndirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  {(form.watch("under18Beneficiaries") || 0) + (form.watch("under18IndirectBeneficiaries") || 0)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">18-34 years</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="age18to34Beneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="age18to34IndirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  {(form.watch("age18to34Beneficiaries") || 0) + (form.watch("age18to34IndirectBeneficiaries") || 0)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">35-54 years</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="age35to54Beneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="age35to54IndirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  {(form.watch("age35to54Beneficiaries") || 0) + (form.watch("age35to54IndirectBeneficiaries") || 0)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">55+ years</td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="over55Beneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2">
                  <FormField
                    control={form.control}
                    name="over55IndirectBeneficiaries"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  {(form.watch("over55Beneficiaries") || 0) + (form.watch("over55IndirectBeneficiaries") || 0)}
                </td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border p-2 font-medium">Total</td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("under18Beneficiaries") || 0) + 
                   (form.watch("age18to34Beneficiaries") || 0) + 
                   (form.watch("age35to54Beneficiaries") || 0) + 
                   (form.watch("over55Beneficiaries") || 0)}
                </td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("under18IndirectBeneficiaries") || 0) + 
                   (form.watch("age18to34IndirectBeneficiaries") || 0) + 
                   (form.watch("age35to54IndirectBeneficiaries") || 0) + 
                   (form.watch("over55IndirectBeneficiaries") || 0)}
                </td>
                <td className="border p-2 text-center font-medium">
                  {(form.watch("under18Beneficiaries") || 0) + 
                   (form.watch("age18to34Beneficiaries") || 0) + 
                   (form.watch("age35to54Beneficiaries") || 0) + 
                   (form.watch("over55Beneficiaries") || 0) +
                   (form.watch("under18IndirectBeneficiaries") || 0) + 
                   (form.watch("age18to34IndirectBeneficiaries") || 0) + 
                   (form.watch("age35to54IndirectBeneficiaries") || 0) + 
                   (form.watch("over55IndirectBeneficiaries") || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Age balance verification */}
        {(form.watch("under18Beneficiaries") + 
          form.watch("age18to34Beneficiaries") + 
          form.watch("age35to54Beneficiaries") + 
          form.watch("over55Beneficiaries") > 0) && 
         (form.watch("under18Beneficiaries") + 
          form.watch("age18to34Beneficiaries") + 
          form.watch("age35to54Beneficiaries") + 
          form.watch("over55Beneficiaries") !== form.watch("directBeneficiaries")) && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
            <p className="text-yellow-800">
              Note: The sum of age groups ({
                form.watch("under18Beneficiaries") + 
                form.watch("age18to34Beneficiaries") + 
                form.watch("age35to54Beneficiaries") + 
                form.watch("over55Beneficiaries")
              }) does not match the total direct beneficiaries ({form.watch("directBeneficiaries")}).
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Geographical Breakdown */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Geographical Breakdown</h3>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-x-4 gap-y-2 items-end border-b pb-4 mb-4">
            <FormField
              control={form.control}
              name={`geographyBreakdown.${index}.country`}
              render={({ field }) => (
                <FormItem className="mb-0">
                  <FormLabel className={index === 0 ? "block" : "sr-only"}>Country*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Country"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`geographyBreakdown.${index}.region`}
              render={({ field }) => (
                <FormItem className="mb-0">
                  <FormLabel className={index === 0 ? "block" : "sr-only"}>Region</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Region"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`geographyBreakdown.${index}.city`}
              render={({ field }) => (
                <FormItem className="mb-0">
                  <FormLabel className={index === 0 ? "block" : "sr-only"}>City*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`geographyBreakdown.${index}.directBeneficiaries`}
              render={({ field }) => (
                <FormItem className="mb-0">
                  <FormLabel className={index === 0 ? "block" : "sr-only"}>Direct</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      className="text-center w-24"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`geographyBreakdown.${index}.indirectBeneficiaries`}
              render={({ field }) => (
                <FormItem className="mb-0">
                  <FormLabel className={index === 0 ? "block" : "sr-only"}>Indirect</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      className="text-center w-24"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                className="mt-2 md:mt-0"
                aria-label="Remove location"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {!isViewMode && (
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ country: "", region: "", city: "", directBeneficiaries: 0, indirectBeneficiaries: 0 })}
          >
            Add Location
          </Button>
        )}

        {/* Display Totals and Verification */} 
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-end space-x-8 font-medium pr-[calc(theme(spacing.4)_+_1rem)]"> {/* Adjust padding to align roughly */} 
            <div>Direct Total: {totalDirectGeography}</div>
            <div>Indirect Total: {totalIndirectGeography}</div>
          </div>

          {/* Verification Checks */} 
          {totalDirectGeography > 0 && totalDirectGeography !== form.watch("directBeneficiaries") && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
              <p className="text-yellow-800">
                Note: The sum of direct beneficiaries by location ({totalDirectGeography})
                does not match the total direct beneficiaries ({form.watch("directBeneficiaries")}).
              </p>
            </div>
          )}
          {totalIndirectGeography > 0 && totalIndirectGeography !== form.watch("indirectBeneficiaries") && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
              <p className="text-yellow-800">
                Note: The sum of indirect beneficiaries by location ({totalIndirectGeography})
                does not match the total indirect beneficiaries ({form.watch("indirectBeneficiaries")}).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Beneficiary Ethnicity Breakdown - Using EthnicityMultiSelect */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Beneficiary Ethnicity Breakdown</h3>

        <FormField
          control={form.control}
          name="detailedEthnicities"
          render={({ field }) => {
            // Helper function to get labels and descriptions for view mode
            const getSelectedEthnicityDisplay = () => {
              const selectedValues = field.value || [];
              if (selectedValues.length === 0) {
                return <span className="text-muted-foreground">No ethnicities selected.</span>;
              }

              const allOptions = ethnicities.flatMap((group: { options: { label: string; value: string; }[] }) => group.options);
              const displayItems = selectedValues.map((value: string) => {
                const option = allOptions.find((opt: { value: string; label: string; }) => opt.value === value);
                let label = option ? option.label : value; // Fallback to value if label not found

                // Append description if it's an "other" option
                if (value === "Any other White background, please describe") {
                  label += `: ${form.getValues("otherWhiteBackground") || "(Not specified)"}`;
                } else if (value === "Any other Mixed/Multiple ethnic background, please describe") {
                  label += `: ${form.getValues("otherMixedBackground") || "(Not specified)"}`;
                } else if (value === "Any other Asian background, please describe") {
                  label += `: ${form.getValues("otherAsianBackground") || "(Not specified)"}`;
                } else if (value === "Any other Black/African/Caribbean background, please describe") {
                  label += `: ${form.getValues("otherBlackBackground") || "(Not specified)"}`;
                } else if (value === "Any other ethnic group, please describe") {
                  label += `: ${form.getValues("otherEthnicGroup") || "(Not specified)"}`;
                }

                return label;
              });

              return (
                <div className="text-sm space-y-1 pt-2">
                  {displayItems.map((item: string, index: number) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              );
            };

            return (
              <FormItem>
                <FormLabel>Detailed Ethnicities</FormLabel>
                {isViewMode ? (
                  getSelectedEthnicityDisplay()
                ) : (
                  <FormControl>
                    <EthnicityMultiSelect
                      value={field.value || []}
                      onChange={field.onChange}
                      disabled={false} // Explicitly false when not in view mode
                    />
                  </FormControl>
                )}
                <FormDescription>
                  {!isViewMode ? "Select all applicable ethnicities from the list. Describe any 'Other' backgrounds selected." : null}
                </FormDescription>
                {!isViewMode && <FormMessage />} {/* Only show errors in edit mode */}
              </FormItem>
            );
          }}
        />

        {/* Conditional Text Inputs for 'Other' descriptions - Only show in Edit Mode */}
        {!isViewMode && form.watch("detailedEthnicities")?.includes("Any other White background, please describe") && (
          <FormField
            control={form.control}
            name="otherWhiteBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other White Background Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the Other White background'
                    disabled={isViewMode}
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isViewMode && form.watch("detailedEthnicities")?.includes("Any other Mixed/Multiple ethnic background, please describe") && (
          <FormField
            control={form.control}
            name="otherMixedBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Mixed Background Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the Other Mixed background'
                    disabled={isViewMode}
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isViewMode && form.watch("detailedEthnicities")?.includes("Any other Asian background, please describe") && (
          <FormField
            control={form.control}
            name="otherAsianBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Asian Background Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the Other Asian background'
                    disabled={isViewMode}
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isViewMode && form.watch("detailedEthnicities")?.includes("Any other Black/African/Caribbean background, please describe") && (
          <FormField
            control={form.control}
            name="otherBlackBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Black Background Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the Other Black background'
                    disabled={isViewMode}
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isViewMode && form.watch("detailedEthnicities")?.includes("Any other ethnic group, please describe") && (
          <FormField
            control={form.control}
            name="otherEthnicGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Ethnic Group Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the Other ethnic group'
                    disabled={isViewMode}
                    className="min-h-[60px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Navigation & Submit Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Achieved Outcomes
        </Button>

      </div>
      
    </div>
  );
} 