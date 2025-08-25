import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AutocompleteInput } from "./autocomplete-input";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
type xlsDataType = Record<string, string | number | Date | null>;

type FiltersProps = {
  data: xlsDataType[];
  setData: React.Dispatch<React.SetStateAction<xlsDataType[]>>;
  xlsData: xlsDataType[];
  legend: string;
  setLegend: React.Dispatch<React.SetStateAction<string>>;
  selectedFilters: Record<string, (string | Date)[]>; // fixed type
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<Record<string, (string | Date)[]>>
  >;
  removeUnknown: boolean;
};

export const Filters = ({
  data,
  setData,
  xlsData,
  legend,
  setLegend,
  selectedFilters: initialSelectedFilters,
  setSelectedFilters: setInitialSelectedFilters,
  removeUnknown,
}: FiltersProps) => {
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsDropdownOpen(false));

  // store filters as arrays of (string | Date)
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, (string | Date)[]>
  >(initialSelectedFilters);

  useEffect(() => {
    setInitialSelectedFilters(selectedFilters);
  }, [selectedFilters, setInitialSelectedFilters]);

  const SpacedNamed = (param: string) => {
    switch (param) {
      case "PoliceStation":
        return "Police Station";
      case "AreaCommittee":
        return "Area Committee";
      case "IntUniqueNo":
        return "Int Unique No";
      case "IntContent":
        return "Int Content";
      case "Name_":
        return "Short name";
      default:
        return param;
    }
  };

  useEffect(() => {
    if (xlsData.length > 0) {
      setFilterLabels(Object.keys(xlsData[0]));
    }
  }, [xlsData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { startDate, endDate, ...otherFilters } = selectedFilters;

    const filteredByDate = xlsData.filter((row) => {
      if (row.Date && typeof row.Date === "string") {
        const dataDate = new Date(
          String(row.Date).split("/").reverse().join("-")
        );

        if (startDate?.length && endDate?.length) {
          return (
            dataDate >= new Date(startDate[0]) &&
            dataDate <= new Date(endDate[0])
          );
        } else if (startDate?.length) {
          return dataDate >= new Date(startDate[0]);
        } else if (endDate?.length) {
          return dataDate <= new Date(endDate[0]);
        }
      }
      return true;
    });

    const finalData = filteredByDate.filter((row) => {
      return Object.entries(otherFilters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        const dataValue = row[key as keyof xlsDataType]?.toString().toLowerCase();
        return values.some(
          (val) => dataValue === val.toString().toLowerCase()
        );
      });
    });

    setData(finalData);
  };

  useEffect(() => {
    if (data.length === 0) {
      toast.info("No data found!");
    }
  }, [data]);

  const handleLabels = (label: string, checked: boolean) => {
    setSelectedFilters((prevFilters) => {
      if (checked) {
        return { ...prevFilters, [label]: [] };
      } else {
        const { [label]: omitted, ...rest } = prevFilters;
        return rest;
      }
    });
  };

  const checkFilterIncludes = (label: string) =>
    Object.keys(selectedFilters).includes(label);

  // only add if valid suggestion
  const handleChange = (
    value: string | Date,
    selected: string,
    suggestions: string[]
  ) => {
    if (value === "" || value === null) return;

    // validate only from dropdown list (skip for date)
    if (
      selected !== "startDate" &&
      selected !== "endDate" &&
      !suggestions.includes(value.toString().toLowerCase())
    ) {
      toast.warning("Please choose a valid option from dropdown!");
      return;
    }

    setSelectedFilters((prev) => {
      const currentValues = prev[selected] || [];
      if (currentValues.includes(value)) return prev;
      return { ...prev, [selected]: [...currentValues, value] };
    });
  };

  const handleRemoveValue = (selected: string, value: string | Date) => {
    setSelectedFilters((prev) => {
      const updated = (prev[selected] || []).filter((v) => v !== value);
      if (updated.length === 0) {
        const { [selected]: omitted, ...rest } = prev;
        return rest;
      }
      return { ...prev, [selected]: updated };
    });
  };

  const getSuggestions = (selected: string) => {
    const uniqueValues = Array.from(
      new Set(xlsData.map((item) => item[selected as keyof xlsDataType]))
    );

    const isNumericField = ["Month", "Strength", "IntUniqueNo", "Week"].includes(
      selected
    );

    const filteredValues = removeUnknown
      ? uniqueValues.filter(
          (value) => value !== null && value !== "Unknown" && value !== "ukn"
        )
      : uniqueValues.filter((value) => value !== null);

    return filteredValues.map((value) =>
      value !== null
        ? isNumericField
          ? String(value) // normalize numbers to string
          : String(value).toLowerCase()
        : ""
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[300px] w-full shadow-xl p-4 shadow-slate-300 flex gap-x-2"
    >
      <div className="w-fit flex flex-col gap-y-2">
        <h2 className="text-lg">Filters</h2>
        <DropdownMenu open={isDropdownOpen}>
          <DropdownMenuTrigger
            className="w-fit"
            asChild
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Button variant="dropDown">Choose Filters</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="flex flex-col gap-y-1 overflow-auto"
            ref={dropdownRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsDropdownOpen(false);
            }}
          >
            {filterLabels.length !== 0 ? (
              filterLabels.map((label) => (
                <DropdownMenuCheckboxItem
                  key={label}
                  checked={checkFilterIncludes(label)}
                  onCheckedChange={(checked) => handleLabels(label, checked)}
                  className={cn(
                    checkFilterIncludes(label) &&
                      "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90"
                  )}
                >
                  {SpacedNamed(label)}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuCheckboxItem>No filters yet</DropdownMenuCheckboxItem>
            )}
            <DropdownMenuCheckboxItem
              key="startDate"
              checked={checkFilterIncludes("startDate")}
              onCheckedChange={(checked) => handleLabels("startDate", checked)}
            >
              Start Date
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              key="endDate"
              checked={checkFilterIncludes("endDate")}
              onCheckedChange={(checked) => handleLabels("endDate", checked)}
            >
              End Date
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="submit" variant="primary" className="w-full">
          Apply Filters
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-fit" asChild>
            <Button variant="dropDown" className="bg-orange-500 text-white">
              Choose legend
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-y-1">
            {filterLabels.length !== 0 ? (
              filterLabels.map((label) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => setLegend(label)}
                  className={cn(
                    legend === label &&
                      "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90"
                  )}
                >
                  {SpacedNamed(label)}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem>No filters yet</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full flex flex-col flex-wrap p-2 gap-2">
        {selectedFilters ? (
          Object.keys(selectedFilters).map((selected) => {
            const suggestions = getSuggestions(selected);
            return (
              <div key={selected} className="flex flex-col gap-y-2">
                {selected === "startDate" || selected === "endDate" ? (
                  <>
                    <label htmlFor={selected} className="text-sm font-medium">
                      {selected === "startDate" ? "Start Date" : "End Date"}
                    </label>
                    <input
                      type="date"
                      id={selected}
                      value={
                        selectedFilters[selected]?.[0]
                          ?.toString()
                          .split("T")[0] || ""
                      }
                      onChange={(e) =>
                        handleChange(e.target.value, selected, suggestions)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </>
                ) : (
                  <>
                    <AutocompleteInput
                      id={selected}
                      label={SpacedNamed(selected)}
                      value=""
                      onChange={(value) =>
                        handleChange(value, selected, suggestions)
                      }
                      suggestions={suggestions}
                      colorize={selected === "Name_"}
                    />
                    <div className="flex flex-wrap gap-1">
                      {selectedFilters[selected]?.map((val, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 rounded-md flex items-center gap-1"
                        >
                          {val.toString()}
                          <button
                            type="button"
                            className="text-red-500 text-xs ml-1"
                            onClick={() => handleRemoveValue(selected, val)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p>No Filters Selected</p>
        )}
      </div>
    </form>
  );
};
