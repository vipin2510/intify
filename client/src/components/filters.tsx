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
  const [selectedFilters, setSelectedFilters] = useState<selectedFiltersType>(
    initialSelectedFilters,
  );
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
        return "Short name"; // Change the display name to "Alias"
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

    // Filter by date range first

    const filteredByDate = xlsData.filter((data) => {
      if (data.Date && typeof data.Date === "string") {
        const dataDate = new Date(
          String(data.Date).split("/").reverse().join("-"),
        );

        if (startDate && endDate) {
          return (
            dataDate >= new Date(startDate) && dataDate <= new Date(endDate)
          );
        } else if (startDate) {
          return dataDate >= new Date(startDate);
        } else if (endDate) {
          return dataDate <= new Date(endDate);
        }
      }

      return true; // No date filter applied
    });

    // Filter by other conditions
    const finalData = filteredByDate.filter((data) => {
      return Object.entries(otherFilters).every(([key, value]) => {
        if (value === undefined || value === "") {
          return true;
        }

        const dataValue = data[key as keyof xlsDataType]
          ?.toString()
          .toLowerCase();
        const filterValue =
          typeof value !== "undefined" && value !== null
            ? value.toString().toLowerCase()
            : "";
        return dataValue === filterValue;
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
      // Type assertion to treat prevFilters as xlsDataType
      const filters = prevFilters as xlsDataType;

      if (checked) {
        // If the checkbox is checked, add the label to the filters
        switch (label) {
          case "Name":
          case "Name_":
          case "AreaCommittee":
          case "District":
          case "Division":
          case "GR":
          case "Rank":
          case "Source":
          case "IntContent":
          case "PoliceStation":
          case "Type":
            return {
              ...filters,
              [label]: "",
            };
          case "Date":
            return {
              ...filters,
              [label]: null,
            };
          case "startDate":
          case "endDate":
            return {
              ...prevFilters,
              [label]: null,
            };
          case "Month":
          case "Strength":
          case "IntUniqueNo":
          case "Week":
            return {
              ...filters,
              [label]: 0,
            };
          default:
            console.log("Unhandled Property Error");
            throw new Error("Unhandled property name");
        }
      } else {
        // If the checkbox is unchecked, remove the label from the filters
        const { [label]: omitted, ...rest } = filters as Record<string, any>;
        return rest;
      }
    });
  };

  const checkFilterIncludes = (label: string) => {
    const keys = Object.keys(selectedFilters);
    if (keys.includes(label)) {
      return true;
    }
    return false;
  };

  const handleChange = (value: string | Date, selected: string) => {
    setSelectedFilters((prev) => {
      if (selected === "startDate" || selected === "endDate") {
        return { ...prev, [selected]: value as Date };
      }
      return { ...prev, [selected]: value };
    });
  };

  const getSuggestions = (selected: string) => {
    const uniqueValues = Array.from(
      new Set(xlsData.map((item) => item[selected as keyof xlsDataType])),
    );
    const isNumericField = [
      "Month",
      "Strength",
      "IntUniqueNo",
      "Week",
    ].includes(selected);
    console.log(uniqueValues.length);
    const filteredValues = removeUnknown
      ? uniqueValues.filter(
          ((value) => value !== null && value !== "Unknown") ||
            ((value) => value !== null && value !== "ukn"),
        )
      : uniqueValues.filter((value) => value !== null);

    return isNumericField
      ? filteredValues.map((value) => (value !== null ? value.toString() : ""))
      : filteredValues.map((value) =>
          value !== null ? value.toString().toLowerCase() : "",
        );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[200px] w-full shadow-xl p-4 shadow-slate-300 flex gap-x-2"
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
              if (e.key === "Escape") {
                setIsDropdownOpen(false);
              }
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
                      "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
                  )}
                >
                  {SpacedNamed(label)}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuCheckboxItem>
                No filters yet
              </DropdownMenuCheckboxItem>
            )}
            <DropdownMenuCheckboxItem
              key="startDate"
              checked={checkFilterIncludes("startDate")}
              onCheckedChange={(checked) => handleLabels("startDate", checked)}
              className={cn(
                checkFilterIncludes("startDate") &&
                  "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
              )}
            >
              Start Date
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              key="endDate"
              checked={checkFilterIncludes("endDate")}
              onCheckedChange={(checked) => handleLabels("endDate", checked)}
              className={cn(
                checkFilterIncludes("endDate") &&
                  "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
              )}
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
                      "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
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
          Object.keys(selectedFilters).map((selected) => (
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
                      selectedFilters[
                        selected as keyof typeof selectedFilters
                      ]?.toString() || ""
                    }
                    onChange={(e) => handleChange(e.target.value, selected)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </>
              ) : (
                <AutocompleteInput
                  id={selected}
                  label={SpacedNamed(selected)}
                  value={
                    selectedFilters[
                      selected as keyof typeof selectedFilters
                    ]?.toString() || ""
                  }
                  onChange={(value) => handleChange(value, selected)}
                  suggestions={getSuggestions(selected)}
                />
              )}
            </div>
          ))
        ) : (
          <p>No Filters Selected</p>
        )}
      </div>
    </form>
  );
};
