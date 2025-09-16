import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export const Filters = () => {
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsDropdownOpen(false));
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(false);

  // Zustand store
  const {
    data,
    setData,
    xlsData,
    legend,
    setLegend,
    selectedFilters,
    removeUnknown,
    setData: setStoreData,
    setSelectedFilters: setStoreSelectedFilters,
  } = useAppStore();

  const [localSelectedFilters, setLocalSelectedFilters] =
    useState<Record<string, (string | Date)[]>>(selectedFilters);

  const glassCard =
    "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";

  useEffect(() => {
    setLocalSelectedFilters(selectedFilters);
  }, [selectedFilters]);

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
    const { startDate, endDate, ...otherFilters } = localSelectedFilters;

    const filteredByDate = xlsData.filter((row) => {
      if (row.Date && typeof row.Date === "string") {
        const dataDate = new Date(
          String(row.Date).split("/").reverse().join("-"),
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

    const finalData = filteredByDate.filter((row) =>
      Object.entries(otherFilters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        const dataValue = row[key as keyof xlsDataType]
          ?.toString()
          .toLowerCase();
        return values.some((val) => dataValue === val.toString().toLowerCase());
      }),
    );

    setData(finalData);
    setStoreData(finalData);
    setStoreSelectedFilters(localSelectedFilters);
  };

  useEffect(() => {
    if (data.length === 0) {
      toast.info("No data found!");
    }
  }, [data]);

  const handleLabels = (label: string, checked: boolean) => {
    setLocalSelectedFilters((prevFilters) => {
      if (checked) {
        return { ...prevFilters, [label]: [] };
      } else {
        const { [label]: omitted, ...rest } = prevFilters;
        return rest;
      }
    });
  };

  const checkFilterIncludes = (label: string) =>
    Object.keys(localSelectedFilters).includes(label);

  const handleChange = (value: string | Date, selected: string) => {
    if (value === "" || value === null) return;
    setLocalSelectedFilters((prev) => {
      const currentValues = prev[selected] || [];
      if (currentValues.includes(value)) return prev;
      return { ...prev, [selected]: [...currentValues, value] };
    });
    setInputValues((prev) => ({ ...prev, [selected]: "" }));
  };

  const handleRemoveValue = (selected: string, value: string | Date) => {
    setLocalSelectedFilters((prev) => {
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
      new Set(xlsData.map((item) => item[selected as keyof xlsDataType])),
    );
    const isNumericField = [
      "Month",
      "Strength",
      "IntUniqueNo",
      "Week",
    ].includes(selected);
    const filteredValues = removeUnknown
      ? uniqueValues.filter(
          (value) => value !== null && value !== "Unknown" && value !== "ukn",
        )
      : uniqueValues.filter((value) => value !== null);
    return filteredValues.map((value) =>
      value !== null
        ? isNumericField
          ? String(value)
          : String(value).toLowerCase()
        : "",
    );
  };

  const summaryText = () => {
    const activeFilters = Object.keys(localSelectedFilters).length;
    return `${activeFilters} filter${activeFilters !== 1 ? "s" : ""} applied · Legend: ${
      legend || "None"
    }`;
  };

  return (
    <div
      className={`absolute top-[8rem] left-4 w-[90vw] sm:w-[320px] z-11 ${glassCard}`}
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer text-white"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium">{summaryText()}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>

      {/* Expandable Content */}
      {expanded && (
        <form
          onSubmit={handleSubmit}
          className="p-4 flex flex-col gap-y-4 text-white"
        >
          {/* Filter Selection */}
          <div className="flex flex-col gap-y-3">
            <h2 className="text-lg font-semibold">Filters</h2>
            <DropdownMenu open={isDropdownOpen}>
              <DropdownMenuTrigger
                className="w-fit"
                asChild
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Button
                  variant="dropDown"
                  className={`${glassCard} text-white`}
                >
                  Choose Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={`flex flex-col gap-y-1 overflow-auto max-h-60 ${glassCard} text-white`}
                ref={dropdownRef}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsDropdownOpen(false);
                }}
              >
                {filterLabels.length ? (
                  filterLabels.map((label) => (
                    <DropdownMenuCheckboxItem
                      key={label}
                      checked={checkFilterIncludes(label)}
                      onCheckedChange={(checked) =>
                        handleLabels(label, checked)
                      }
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
                  onCheckedChange={(checked) =>
                    handleLabels("startDate", checked)
                  }
                >
                  Start Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  key="endDate"
                  checked={checkFilterIncludes("endDate")}
                  onCheckedChange={(checked) =>
                    handleLabels("endDate", checked)
                  }
                >
                  End Date
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button type="submit" className={`${glassCard} text-white`}>
              Apply Filters
            </Button>
          </div>

          {/* Legend Selection */}
          <div className="flex flex-col gap-y-3">
            <h2 className="text-lg font-semibold">Legend</h2>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-fit" asChild>
                <Button
                  variant="dropDown"
                  className={`${glassCard} text-white`}
                >
                  {legend ? SpacedNamed(legend) : "Choose Legend"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={`flex flex-col gap-y-1 overflow-auto max-h-60 ${glassCard}`}
              >
                {filterLabels.length ? (
                  filterLabels.map((label) => (
                    <DropdownMenuItem
                      key={label}
                      onClick={() => setLegend(label)}
                      className={cn(
                        legend === label && "bg-blue-600/70 text-white",
                      )}
                    >
                      {SpacedNamed(label)}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>No legend yet</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Inputs */}
          <div className="flex flex-col gap-4">
            {localSelectedFilters &&
            Object.keys(localSelectedFilters).length > 0 ? (
              Object.keys(localSelectedFilters).map((selected) => {
                const suggestions = getSuggestions(selected);
                const inputValue = inputValues[selected] || "";
                const filteredSuggestions = suggestions.filter((s) =>
                  s.toLowerCase().includes(inputValue.toLowerCase()),
                );
                return (
                  <div
                    key={selected}
                    className="flex flex-col gap-y-2 relative"
                  >
                    {selected === "startDate" || selected === "endDate" ? (
                      <>
                        <label
                          htmlFor={selected}
                          className="text-sm font-medium text-white"
                        >
                          {selected === "startDate" ? "Start Date" : "End Date"}
                        </label>
                        <input
                          type="date"
                          id={selected}
                          value={
                            localSelectedFilters[selected]?.[0]
                              ?.toString()
                              .split("T")[0] || ""
                          }
                          onChange={(e) =>
                            handleChange(e.target.value, selected)
                          }
                          className="border border-white/30 bg-transparent text-white placeholder-gray-300 rounded-md px-3 py-2"
                        />
                      </>
                    ) : (
                      <>
                        <label
                          htmlFor={selected}
                          className="text-sm font-medium text-white"
                        >
                          {SpacedNamed(selected)}
                        </label>
                        <input
                          type="text"
                          id={selected}
                          value={inputValue}
                          onChange={(e) =>
                            setInputValues((prev) => ({
                              ...prev,
                              [selected]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleChange(inputValue, selected);
                            }
                          }}
                          className="border border-white/30 bg-transparent text-white placeholder-gray-300 rounded-md px-3 py-2"
                          placeholder="Type to search or add"
                        />
                        {inputValue && filteredSuggestions.length > 0 && (
                          <ul
                            className={`absolute top-full left-0 w-full ${glassCard} text-white max-h-40 overflow-y-auto z-10`}
                          >
                            {filteredSuggestions.map((s, idx) => (
                              <li
                                key={idx}
                                className="px-3 py-2 hover:bg-gray-200/30 cursor-pointer"
                                onClick={() => handleChange(s, selected)}
                              >
                                {s}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {localSelectedFilters[selected]?.map((val, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-blue-500/30 text-white rounded-md flex items-center gap-1"
                            >
                              {val.toString()}
                              <button
                                type="button"
                                className="text-red-400 text-xs ml-1"
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
              <p className="text-white/70">No Filters Selected</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
