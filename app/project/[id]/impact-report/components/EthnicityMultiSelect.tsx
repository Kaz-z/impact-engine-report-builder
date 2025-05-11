import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

// Define the ethnicity structure
interface EthnicityOption {
  label: string;
  value: string;
}

interface EthnicityGroup {
  groupLabel: string;
  options: EthnicityOption[];
}

export const ethnicities: EthnicityGroup[] = [
  {
    groupLabel: "White",
    options: [
      { label: "Scottish/English/Welsh/Northern Irish/British", value: "Scottish/English/Welsh/Northern Irish/British" },
      { label: "Irish", value: "Irish" },
      { label: "Gypsy or Irish Traveller", value: "Gypsy or Irish Traveller" },
      { label: "Any other White background, please describe", value: "Any other White background, please describe" },
    ],
  },
  {
    groupLabel: "Mixed/Multiple ethnic groups",
    options: [
      { label: "White and Black Caribbean", value: "White and Black Caribbean" },
      { label: "White and Black African", value: "White and Black African" },
      { label: "White and Asian", value: "White and Asian" },
      { label: "Any other Mixed/Multiple ethnic background, please describe", value: "Any other Mixed/Multiple ethnic background, please describe" },
    ],
  },
  {
    groupLabel: "Asian/Asian British",
    options: [
      { label: "Indian", value: "Indian" },
      { label: "Pakistani", value: "Pakistani" },
      { label: "Bangladeshi", value: "Bangladeshi" },
      { label: "Chinese", value: "Chinese" },
      { label: "Any other Asian background, please describe", value: "Any other Asian background, please describe" },
    ],
  },
  {
    groupLabel: "Black/African/Caribbean/Black British",
    options: [
      { label: "African", value: "African" },
      { label: "Caribbean", value: "Caribbean" },
      { label: "Any other Black/African/Caribbean background, please describe", value: "Any other Black/African/Caribbean background, please describe" },
    ],
  },
  {
    groupLabel: "Other ethnic group",
    options: [
      { label: "Arab", value: "Arab" },
      { label: "Any other ethnic group, please describe", value: "Any other ethnic group, please describe" },
    ],
  },
];

// Flatten the list for easier filtering, keeping group info if needed later
const allEthnicityOptions: (EthnicityOption & { group: string })[] = ethnicities.flatMap(group =>
  group.options.map(option => ({ ...option, group: group.groupLabel }))
);

// Ethnicity selection component
interface EthnicityMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function EthnicityMultiSelect({ value = [], onChange, disabled }: EthnicityMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter based on search query
  const filteredOptions = allEthnicityOptions.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered options back for display
  const filteredGroups: EthnicityGroup[] = ethnicities
    .map(group => ({
      ...group,
      options: group.options.filter(option =>
        filteredOptions.some(filtered => filtered.value === option.value)
      ),
    }))
    .filter(group => group.options.length > 0);

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
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

  // Handle selection and deselection
  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(val => val !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // Display selected items in the trigger button
  const displayValue = () => {
    if (value.length === 0) {
      return <span className="text-muted-foreground">Select ethnicities...</span>;
    }
    if (value.length === 1) {
      return value[0];
    }
    // Find the full label for the first selected item if needed for better display
    const firstLabel = allEthnicityOptions.find(opt => opt.value === value[0])?.label || value[0];
    return (
      <span className="truncate">
        {firstLabel}
        {value.length > 1 ? ` + ${value.length - 1} more` : ""}
      </span>
    );
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
            className="w-full justify-between text-left h-auto min-h-[2.5rem] px-3 py-2" // Adjust height for better text wrapping if needed
          >
            {displayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[350px] p-0" align="start">
          <div className="flex items-center border-b px-3 pb-2 pt-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={searchInputRef}
              placeholder="Search ethnicities..."
              className="h-8 border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          {searchQuery && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {filteredOptions.length} {filteredOptions.length === 1 ? "option" : "options"} found
            </div>
          )}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredGroups.length > 0 ? (
              <div className="grid gap-1 p-1">
                {filteredGroups.map(group => (
                  <div key={group.groupLabel} className="mb-2 last:mb-0">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground sticky top-0 bg-popover">
                      {group.groupLabel}
                    </div>
                    {group.options.map(option => {
                      const isSelected = value.includes(option.value);
                      return (
                        <div
                          key={option.value}
                          className={`flex items-center rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent ${
                            isSelected ? "bg-accent/50" : ""
                          }`}
                          onClick={() => handleSelect(option.value)}
                        >
                          <Checkbox
                            id={`ethnicity-${option.value.replace(/\s+/g, '-')}`}
                            checked={isSelected}
                            onCheckedChange={() => handleSelect(option.value)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`ethnicity-${option.value.replace(/\s+/g, '-')}`}
                            className="text-sm cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ))}
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