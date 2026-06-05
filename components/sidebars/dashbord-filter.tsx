import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import images from "@/constants/image";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import Refresh2 from "@/public/assets/refresh2.png";

type Variant =
  | "all"
  | "connections"
  | "saved-directory"
  | "pending"
  | "dashboard"
  | "all-directory";

interface FilterSidebarProps {
  variant: Variant;
  onFilterChange?: (filters: FilterValues) => void;
}

interface FilterValues {
  country: string;
  industry: string;
  position: string;
}

// Options
const countries = [
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ghana",
  "Egypt",
  "United States",
  "United Kingdom",
  "Canada",
  "Singapore",
];
const industries = [
  "Consulting",
  "Legal Services",
  "Accounting & Bookkeeping",
  "Marketing & Advertising",
  "Business Coaching",
  "Virtual Assistance",
  "HR & Recruitment",
  "Technology",
  "Finance",
  "Healthcare",
  "E-Commerce",
  "Renewable Energy",
  "Finance & Investment",
  "Healthcare Technology",
];
const positions = [
  "CEO",
  "CTO",
  "CFO",
  "COO",
  "Manager",
  "Engineer",
  "Director",
  "Founder",
  "Co-Founder",
  "Partner",
  "Managing Director",
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  variant,
  onFilterChange,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilters = {
    country: searchParams.get("country") || "",
    industry: searchParams.get("industry") || "",
    position: searchParams.get("position") || "",
  };

  // Filter selection states
  const [selectedCountry, setSelectedCountry] = useState(
    currentFilters.country || "",
  );
  const [selectedIndustry, setSelectedIndustry] = useState(
    currentFilters.industry || "",
  );
  const [selectedPosition, setSelectedPosition] = useState(
    currentFilters.position || "",
  );

  // Search states for dropdowns
  const [searchCountry, setSearchCountry] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchPosition, setSearchPosition] = useState("");

  // Open/close states for icons
  const [openCountry, setOpenCountry] = useState(false);
  const [openIndustry, setOpenIndustry] = useState(false);
  const [openPosition, setOpenPosition] = useState(false);

  // Sheet open state
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Loading state for filter submission
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const isDirectoryPage = pathname.startsWith("/directory");

  // Handle search/filter submission
  const handleSearch = () => {
    setIsApplyingFilters(true);

    const filters: FilterValues = {
      country: selectedCountry,
      industry: selectedIndustry,
      position: selectedPosition,
    };

    if (onFilterChange) {
      onFilterChange(filters);
    }

    const params = new URLSearchParams();
    if (selectedCountry) params.set("country", selectedCountry);
    if (selectedIndustry) params.set("industry", selectedIndustry);
    if (selectedPosition) params.set("position", selectedPosition);
    window.location.href = `${pathname}?${params.toString()}`;
    setIsApplyingFilters(false);
    setIsSheetOpen(false);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setIsApplyingFilters(true);
    setSelectedCountry("");
    setSelectedIndustry("");
    setSelectedPosition("");
    setSearchCountry("");
    setSearchIndustry("");
    setSearchPosition("");

    window.location.href = pathname;
    setIsApplyingFilters(false);
    setIsSheetOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedCountry || selectedIndustry || selectedPosition;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <div
          className={`flex items-start ${isDirectoryPage ? "w-[30%]" : "w-[10%]"}`}
        >
          {variant === "dashboard" && (
            <div
              className={`flex items-center justify-end md:items-end md:pr-2 lg:items-center ${isDirectoryPage ? "" : ""} `}
            >
              <Image
                src={images.desktopSlide}
                width={40}
                height={40}
                className="hidden cursor-pointer lg:mt-2 lg:block lg:h-8 lg:w-8 xl:mt-0 xl:h-10 xl:w-10"
                alt="filter"
              />
              <Image
                src={images.preferenceHorizontal}
                width={28}
                height={28}
                className="h-7 w-7 cursor-pointer lg:hidden"
                alt="filter"
              />
              <Image
                alt=""
                src={Refresh2}
                width={32}
                height={32}
                className="ml-8.25"
              />
            </div>
          )}

          {/* FOR ALL DIRECTORY */}
          {variant === "all" && (
            <div
              className={`relative flex w-[40px] items-center justify-end md:w-[100px] md:items-end md:pr-2 lg:w-[50px] lg:items-center ${isDirectoryPage ? "xl:w-[70px]" : "xl:w-[130px]"} `}
            >
              <Image
                src={images.desktopSlide}
                width={40}
                height={40}
                className="hidden cursor-pointer lg:mt-2 lg:block lg:h-8 lg:w-8 xl:mt-0 xl:h-10 xl:w-10"
                alt="filter"
              />
              <Image
                src={images.preferenceHorizontal}
                width={24}
                height={24}
                className="h-6 w-6 cursor-pointer lg:hidden"
                alt="filter"
              />
              {/* Filter active indicator */}
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-[8px] text-white lg:-top-1 lg:-right-2"></span>
              )}
            </div>
          )}

          {/* REFRESH CONTAINER FOR DIRECTORY SCREEN */}
          {isDirectoryPage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              title="Clear filters & refresh"
              className={`ml-6 hidden h-12 cursor-pointer lg:flex ${variant === "all" ? "" : "mr-16"} w-12 items-center justify-center gap-2 rounded-full bg-deepBlack hover:bg-deepBlack/80`}
            >
              <Image
                src={images.refresh}
                width={32}
                height={32}
                className="h-8 w-8"
                alt=""
              />
            </button>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="w-[336px] overflow-y-auto top-[53px] h-[80vh] max-w-[240px] overflow-y-auto lg:h-full lg:top-0 lg:max-w-max rounded-l-[40px] p-5 lg:p-10 pb-20 xl:pb-0 dark:bg-gray-800 dark:text-gray-100">
        <SheetHeader>
          <SheetTitle className="mb-2 text-base lg:text-lg font-semibold text-deepBlack md:text-2xl dark:text-gray-100">
            Filter By
          </SheetTitle>
          <SheetDescription className="text-[11px] lg:text-xs text-deepBlack md:text-sm dark:text-gray-400">
            Filter users by country, industry, or position to find the right
            connections.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 px-2 pt-1 pb-4 md:py-4">
          {/* Country */}
          <div className="relative">
            <label
              htmlFor="country"
              className="text-xs lg:text-sm font-semibold text-darkBlue md:text-base dark:text-gray-200"
            >
              Country
            </label>
            <div className="mt-2">
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                onOpenChange={(o) => setOpenCountry(o)}
              >
                <SelectTrigger
                  id="country"
                  className="flex w-full justify-between rounded-none border py-2 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                >
                  <SelectValue
                    className="w-full whitespace-nowrap"
                    placeholder="Choose a country"
                  />
                  {openCountry ? (
                    <span className="pointer-events-none absolute right-4 rotate-180 transform">
                      <Image
                        src={images.dropDownSelect}
                        width={12}
                        height={6}
                        className="h-1.5 w-full"
                        alt=""
                      />
                    </span>
                  ) : (
                    <span className="pointer-events-none absolute right-4 transform">
                      <Image
                        src={images.dropDownSelect}
                        width={12}
                        height={6}
                        className="h-1.5 w-full"
                        alt=""
                      />
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="select-dropdown-shadow max-h-60 w-[245px] text-[10px] lg:text-base overflow-y-auto border py-1 [&_svg]:hidden"
                >
                  <div className="sticky top-0 z-10 mt-0 mb-2 bg-white dark:bg-gray-700">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={searchCountry}
                      onChange={(e) => setSearchCountry(e.target.value)}
                      className="mb-2 w-full  rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                    />
                  </div>
                  {countries
                    .filter((c) =>
                      c.toLowerCase().includes(searchCountry.toLowerCase()),
                    )
                    .map((c, i) => (
                      <SelectItem
                        className="cursor-pointer data-[highlighted]:bg-[#CCA6FF]/15 data-[highlighted]:text-deepBlack"
                        key={i}
                        value={c}
                      >
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Industry */}
          <div className="relative">
            <label
              htmlFor="industry"
              className="text-xs lg:text-sm font-semibold text-darkBlue md:text-base dark:text-gray-200"
            >
              Industry
            </label>
            <div className="mt-2">
              <Select
                value={selectedIndustry}
                onValueChange={setSelectedIndustry}
                onOpenChange={(o) => setOpenIndustry(o)}
              >
                <SelectTrigger
                  id="industry"
                  className="flex w-full justify-between rounded-none border py-2 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                >
                  <SelectValue
                    className="w-full whitespace-nowrap"
                    placeholder="Choose an industry"
                  />
                  {openIndustry ? (
                    <span className="pointer-events-none absolute right-4 rotate-180 transform">
                      <Image
                        src={images.dropDownSelect}
                        width={12}
                        height={6}
                        className="h-1.5 w-full"
                        alt=""
                      />
                    </span>
                  ) : (
                    <span className="pointer-events-none absolute right-4 transform">
                      <Image
                        src={images.dropDownSelect}
                        width={12}
                        height={6}
                        className="h-1.5 w-full"
                        alt=""
                      />
                    </span>
                  )}
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="select-dropdown-shadow max-h-60 w-[245px] overflow-y-auto border [&_svg]:hidden"
                >
                  <div className="sticky top-0 z-10 mt-0 mb-2 bg-white dark:bg-gray-700">
                    <input
                      type="text"
                      placeholder="Search industry..."
                      value={searchIndustry}
                      onChange={(e) => setSearchIndustry(e.target.value)}
                      className="mb-2 w-full rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                    />
                  </div>
                  {industries
                    .filter((ind) =>
                      ind.toLowerCase().includes(searchIndustry.toLowerCase()),
                    )
                    .map((ind, i) => (
                      <SelectItem
                        className="cursor-pointer data-[highlighted]:bg-[#CCA6FF]/15 data-[highlighted]:text-deepBlack"
                        key={i}
                        value={ind}
                      >
                        {ind}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Position */}
          <div className="relative">
            <label
              htmlFor="position"
              className="text-sm font-semibold text-darkBlue md:text-base dark:text-gray-200"
            >
              Position
            </label>
            <div className="mt-2">
              <Select
                value={selectedPosition}
                onValueChange={setSelectedPosition}
                onOpenChange={(o) => setOpenPosition(o)}
              >
                <SelectTrigger
                  id="position"
                  className="flex w-full justify-between rounded-none border py-2 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                >
                  <SelectValue
                    className="w-full whitespace-nowrap"
                    placeholder="Select a position"
                  />
                  {openPosition ? (
                    <span className="pointer-events-none absolute right-4 rotate-180 transform">
                      <Image
                        src={images.dropDownSelect}
                        width={12}
                        height={6}
                        className="h-1.5 w-full"
                        alt=""
                      />
                    </span>
                  ) : (
                    <span className="pointer-events-none absolute right-4 transform">
                      <Image
                        src={images.dropDownSelect}
                        width={12}
                        height={6}
                        className="h-1.5 w-full"
                        alt=""
                      />
                    </span>
                  )}
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="select-dropdown-shadow max-h-60 w-[245px] overflow-y-auto border focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                >
                  <div className="sticky top-0 z-10 mb-2">
                    <input
                      type="text"
                      placeholder="Search position..."
                      value={searchPosition}
                      onChange={(e) => setSearchPosition(e.target.value)}
                      className="mb-2 w-full rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                    />
                  </div>
                  {positions
                    .filter((p) =>
                      p.toLowerCase().includes(searchPosition.toLowerCase()),
                    )
                    .map((p, i) => (
                      <SelectItem
                        className="cursor-pointer data-[highlighted]:bg-[#CCA6FF]/15 data-[highlighted]:text-deepBlack"
                        key={i}
                        value={p}
                      >
                        {p}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2 px-2">
            {selectedCountry && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                {selectedCountry}
                <button
                  onClick={() => setSelectedCountry("")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            )}
            {selectedIndustry && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                {selectedIndustry}
                <button
                  onClick={() => setSelectedIndustry("")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            )}
            {selectedPosition && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                {selectedPosition}
                <button
                  onClick={() => setSelectedPosition("")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSearch}
            disabled={isApplyingFilters}
            className="w-full rounded-full py-4.5 lg:py-6 text-[11px] lg:text-base font-semibold text-white shadow-xl md:text-base lg:text-lg disabled:opacity-70"
            style={{ backgroundColor: "#193E47" }}
          >
            {isApplyingFilters ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Applying...
              </span>
            ) : (
              "Apply Filters"
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              disabled={isApplyingFilters}
              variant="outline"
              className="w-full rounded-full  py-4.5 lg:py-6 text-[11px] lg:text-base  font-semibold text-deepBlack md:text-base lg:text-lg disabled:opacity-70"
            >
              {isApplyingFilters ? "Clearing..." : "Clear All Filters"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
