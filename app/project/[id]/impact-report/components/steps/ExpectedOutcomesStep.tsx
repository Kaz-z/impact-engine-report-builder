import React, { memo, useCallback, useState } from "react";
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
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define proper types for the textarea props
interface MemoizedTextareaProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Memoized textarea component to prevent re-renders
const MemoizedTextarea = memo(
  ({ value, onChange, onBlur, placeholder, className, disabled }: MemoizedTextareaProps) => {
    const [localValue, setLocalValue] = useState(value || "");
    
    // Update local value when prop value changes
    React.useEffect(() => {
      setLocalValue(value || "");
    }, [value]);
    
    // Debounced update to parent
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      
      // Debounce the onChange callback
      const timeoutId = setTimeout(() => {
        onChange(newValue);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }, [onChange]);
    
    return (
      <Textarea
        value={localValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    );
  },
  (prevProps, nextProps) => 
    // Only re-render if these props change
    prevProps.disabled === nextProps.disabled && 
    prevProps.placeholder === nextProps.placeholder
);

// Add display name
MemoizedTextarea.displayName = 'MemoizedTextarea';

interface ExpectedOutcomesStepProps {
  form: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    control: any;
    watch: (name: string) => any;
    getValues: (name?: string) => any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };
  isViewMode: boolean;
  nextStep: () => void;
  prevStep: () => void;
}

// Apply React.memo to the entire component to prevent unnecessary re-renders
function ExpectedOutcomesStep({
  form,
  isViewMode,
  nextStep,
  prevStep,
}: ExpectedOutcomesStepProps) {
  // Extract form.watch calls to variables to prevent re-renders from JSX
  const includeOutcome2 = form.watch("includeOutcome2");
  const includeOutcome3 = form.watch("includeOutcome3");
  
  // Memoize callbacks to prevent recreation on render
  const handlePrevStep = useCallback(() => {
    prevStep();
  }, [prevStep]);
  
  const handleNextStep = useCallback(() => {
    nextStep();
  }, [nextStep]);
  
  // For debugging - remove in production
  // console.log('rendered');
  
  return (
    <div>
      {/* Outcome 1 */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Outcome 1</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="outcome1Qualitative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualitative Description*</FormLabel>
                <FormControl>
                  <MemoizedTextarea
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Describe the expected outcome in qualitative terms"
                    className="min-h-20"
                    disabled={isViewMode}
                  />
                </FormControl>
                <FormDescription>
                  Describe what you hope to achieve with this outcome (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outcome1Quantitative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantitative Measure*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., '500 people trained' or '3 schools built'"
                    disabled={isViewMode}
                  />
                </FormControl>
                <FormDescription>
                  Provide a measurable indicator for this outcome
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Outcome 2 - Optional */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="includeOutcome2"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isViewMode}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Include Outcome 2</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {includeOutcome2 && (
          <div className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="outcome2Qualitative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualitative Description*</FormLabel>
                  <FormControl>
                    <MemoizedTextarea
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Describe the expected outcome in qualitative terms"
                      className="min-h-20"
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what you hope to achieve with this outcome (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcome2Quantitative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantitative Measure*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., '500 people trained' or '3 schools built'"
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a measurable indicator for this outcome
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* Outcome 3 - Optional */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-6 mt-6">
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="includeOutcome3"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isViewMode}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Include Outcome 3</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {includeOutcome3 && (
          <div className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="outcome3Qualitative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualitative Description*</FormLabel>
                  <FormControl>
                    <MemoizedTextarea
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Describe the expected outcome in qualitative terms"
                      className="min-h-20"
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what you hope to achieve with this outcome (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcome3Quantitative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantitative Measure*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., '500 people trained' or '3 schools built'"
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a measurable indicator for this outcome
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          onClick={handlePrevStep}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project Details
        </Button>
        
        <Button
          type="button"
          onClick={handleNextStep}
        >
          Next: Achieved Outcomes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Add display name
ExpectedOutcomesStep.displayName = 'ExpectedOutcomesStep';

// Export memo-wrapped component
export default memo(ExpectedOutcomesStep); 