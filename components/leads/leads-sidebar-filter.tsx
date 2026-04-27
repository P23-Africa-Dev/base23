import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import images from '@/constants/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

type Variant = 'all' | 'company' | 'person';

interface FilterSidebarProps {
    variant: Variant;
    onFilterChange?: (filters: { collectionOnly: boolean }) => void;
}

interface FilterValues {
    country: string;
    industry: string;
    position: string;
    companyType: string;
    companySize: string;
    yearsOfOperation: string;
    collectionOnly: boolean;
}

// Options
const countries = ['Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Egypt', 'United States', 'United Kingdom', 'Canada', 'Singapore'];
const industries = [
    'Consulting',
    'Legal Services',
    'Accounting & Bookkeeping',
    'Marketing & Advertising',
    'Business Coaching',
    'Virtual Assistance',
    'HR & Recruitment',
    'Technology',
    'Finance',
    'Healthcare',
    'E-Commerce',
    'Renewable Energy',
    'Finance & Investment',
    'Healthcare Technology',
    'Fintech',
    'AgriTech',
    'EdTech',
    'Logistics',
    'Construction Tech',
];
const positions = ['CEO', 'CTO', 'CFO', 'COO', 'Manager', 'Engineer', 'Director', 'Founder', 'Co-Founder', 'Partner', 'Managing Director', 'Product Manager', 'Investment Analyst', 'Growth Lead', 'Operations Manager'];
const companyTypes = ['Startup', 'SME', 'Enterprise', 'Non-Profit', 'Government', 'Agency', 'Freelancer', 'Consulting Firm'];
const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const yearsOfOperationOptions = ['0-1', '1-3', '3-5', '5-10', '10-20', '20+'];

export const LeadsFilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
    const searchParams = useSearchParams();
    const currentFilters = {
        country: searchParams.get('country') || '',
        industry: searchParams.get('industry') || '',
        position: searchParams.get('position') || '',
    };

    // Filter selection states
    const [selectedCountry, setSelectedCountry] = useState(currentFilters.country);
    const [selectedIndustry, setSelectedIndustry] = useState(currentFilters.industry);
    const [selectedPosition, setSelectedPosition] = useState(currentFilters.position);
    const [selectedCompanyType, setSelectedCompanyType] = useState(currentFilters.companyType || '');
    const [selectedCompanySize, setSelectedCompanySize] = useState(currentFilters.companySize || '');
    const [selectedYearsOfOperation, setSelectedYearsOfOperation] = useState(currentFilters.yearsOfOperation || '');

    // Search states for dropdowns
    const [searchCountry, setSearchCountry] = useState('');
    const [searchIndustry, setSearchIndustry] = useState('');
    const [searchPosition, setSearchPosition] = useState('');
    const [searchCompanyType, setSearchCompanyType] = useState('');
    const [searchCompanySize, setSearchCompanySize] = useState('');
    const [searchYearsOfOperation, setSearchYearsOfOperation] = useState('');

    // Open/close states for icons
    const [openCountry, setOpenCountry] = useState(false);
    const [openIndustry, setOpenIndustry] = useState(false);
    const [openPosition, setOpenPosition] = useState(false);
    const [openCompanyType, setOpenCompanyType] = useState(false);
    const [openCompanySize, setOpenCompanySize] = useState(false);
    const [openYearsOfOperation, setOpenYearsOfOperation] = useState(false);

    // Sheet open state
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Loading state for filter submission
    const [isApplyingFilters, setIsApplyingFilters] = useState(false);


    const [collectionOnly, setCollectionOnly] = useState(false);

    const toggleCollection = (nextValue: boolean) => {
        setCollectionOnly(nextValue);
        onFilterChange?.({ collectionOnly: nextValue });
    };

    // Check if any filters are active
    const hasActiveFilters = selectedCountry || selectedIndustry || selectedPosition || selectedCompanyType || selectedCompanySize || selectedYearsOfOperation;

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCountry('');
        setSelectedIndustry('');
        setSelectedPosition('');
        setSelectedCompanyType('');
        setSelectedCompanySize('');
        setSelectedYearsOfOperation('');
    };

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            {/* Filter Collections */}
            <div className="w-[15%]">
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCollection(true);
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleCollection(false);
                                }}
                                title="Filter collections"
                                className={`ml-6 hidden h-11 w-11 items-center justify-center rounded-full transition lg:flex ${collectionOnly ? 'bg-[#193E47]' : 'bg-darkBlue'} `}
                            >
                                <img
                                    src={images.bookmark}
                                    className={`h-5.5 w-5.5 transition ${collectionOnly ? 'opacity-100' : 'opacity-60'}`}
                                    alt="collection filter"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent
                            side="top"
                            align="center"
                            className="w-[160px] rounded-md bg-white px-3 py-1.5 text-center text-[8px] text-deepBlack shadow-md"
                        >
                            Double click to remove filtered collection
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <SheetTrigger asChild>
                <div className={`flex w-auto items-start gap-x-10 -ml-4 mr-4`}>
                    <div className={`relative flex items-center justify-end md:items-end md:pr-2 lg:items-center`}>
                        <img
                            src={images.desktopSlide}
                            className="hidden cursor-pointer lg:mt-2 lg:block lg:h-8 lg:w-8 xl:mt-0 xl:h-10 xl:w-10"
                            alt="filter"
                        />
                        <img src={images.preferenceHorizontal} className="h-6 w-6 cursor-pointer lg:hidden" alt="filter" />
                        {/* Filter active indicator */}
                        {hasActiveFilters && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-[8px] text-white lg:-top-1 lg:-right-2"></span>
                        )}
                    </div>
                </div>
            </SheetTrigger>

            <SheetContent className="w-[336px] overflow-y-auto top-[53px] h-[80vh] max-w-[280px] lg:h-full lg:top-0 lg:max-w-max rounded-l-[40px] p-5 lg:p-8 pb-20 xl:pb-6 dark:bg-gray-800 dark:text-gray-100">
                <SheetHeader>
                    <SheetTitle className="mb-1 text-base lg:text-xl font-bold text-deepBlack md:text-2xl dark:text-gray-100">Filter By;</SheetTitle>
                    <SheetDescription className="text-[10px] lg:text-xs text-gray-500 md:text-sm dark:text-gray-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 px-1 pt-4 pb-4 md:py-4">
                    {/* Country */}
                    <div className="relative">
                        <label htmlFor="country" className="text-sm lg:text-base font-semibold text-darkBlue dark:text-gray-200">
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
                                    className="flex w-full justify-between rounded-md border border-gray-300 py-2.5 px-3 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <SelectValue className="w-full whitespace-nowrap text-gray-400" placeholder="Select a category" />
                                    {openCountry ? (
                                        <span className="pointer-events-none absolute right-4 rotate-180 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    ) : (
                                        <span className="pointer-events-none absolute right-4 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
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
                                            className="mb-2 w-full rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                                        />
                                    </div>
                                    {countries
                                        .filter((c) => c.toLowerCase().includes(searchCountry.toLowerCase()))
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
                        <label htmlFor="industry" className="text-sm lg:text-base font-semibold text-darkBlue dark:text-gray-200">
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
                                    className="flex w-full justify-between rounded-md border border-gray-300 py-2.5 px-3 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <SelectValue className="w-full whitespace-nowrap text-gray-400" placeholder="Select a category" />
                                    {openIndustry ? (
                                        <span className="pointer-events-none absolute right-4 rotate-180 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    ) : (
                                        <span className="pointer-events-none absolute right-4 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
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
                                        .filter((ind) => ind.toLowerCase().includes(searchIndustry.toLowerCase()))
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
                        <label htmlFor="position" className="text-sm lg:text-base font-semibold text-darkBlue dark:text-gray-200">
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
                                    className="flex w-full justify-between rounded-md border border-gray-300 py-2.5 px-3 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <SelectValue className="w-full whitespace-nowrap text-gray-400" placeholder="Select a category" />
                                    {openPosition ? (
                                        <span className="pointer-events-none absolute right-4 rotate-180 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    ) : (
                                        <span className="pointer-events-none absolute right-4 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
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
                                        .filter((p) => p.toLowerCase().includes(searchPosition.toLowerCase()))
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

                    {/* Company Type */}
                    <div className="relative">
                        <label htmlFor="companyType" className="text-sm lg:text-base font-semibold text-darkBlue dark:text-gray-200">
                            Company Type
                        </label>
                        <div className="mt-2">
                            <Select
                                value={selectedCompanyType}
                                onValueChange={setSelectedCompanyType}
                                onOpenChange={(o) => setOpenCompanyType(o)}
                            >
                                <SelectTrigger
                                    id="companyType"
                                    className="flex w-full justify-between rounded-md border border-gray-300 py-2.5 px-3 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <SelectValue className="w-full whitespace-nowrap text-gray-400" placeholder="Select a category" />
                                    {openCompanyType ? (
                                        <span className="pointer-events-none absolute right-4 rotate-180 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    ) : (
                                        <span className="pointer-events-none absolute right-4 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    )}
                                </SelectTrigger>

                                <SelectContent
                                    position="popper"
                                    sideOffset={4}
                                    className="select-dropdown-shadow max-h-60 w-[245px] overflow-y-auto border focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <div className="sticky top-0 z-10 mb-2 bg-white dark:bg-gray-700">
                                        <input
                                            type="text"
                                            placeholder="Search company type..."
                                            value={searchCompanyType}
                                            onChange={(e) => setSearchCompanyType(e.target.value)}
                                            className="mb-2 w-full rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                                        />
                                    </div>
                                    {companyTypes
                                        .filter((ct) => ct.toLowerCase().includes(searchCompanyType.toLowerCase()))
                                        .map((ct, i) => (
                                            <SelectItem
                                                className="cursor-pointer data-[highlighted]:bg-[#CCA6FF]/15 data-[highlighted]:text-deepBlack"
                                                key={i}
                                                value={ct}
                                            >
                                                {ct}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Company Size */}
                    <div className="relative">
                        <label htmlFor="companySize" className="text-sm lg:text-base font-semibold text-darkBlue dark:text-gray-200">
                            Company Size
                        </label>
                        <div className="mt-2">
                            <Select
                                value={selectedCompanySize}
                                onValueChange={setSelectedCompanySize}
                                onOpenChange={(o) => setOpenCompanySize(o)}
                            >
                                <SelectTrigger
                                    id="companySize"
                                    className="flex w-full justify-between rounded-md border border-gray-300 py-2.5 px-3 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <SelectValue className="w-full whitespace-nowrap text-gray-400" placeholder="Select a category" />
                                    {openCompanySize ? (
                                        <span className="pointer-events-none absolute right-4 rotate-180 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    ) : (
                                        <span className="pointer-events-none absolute right-4 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    )}
                                </SelectTrigger>

                                <SelectContent
                                    position="popper"
                                    sideOffset={4}
                                    className="select-dropdown-shadow max-h-60 w-[245px] overflow-y-auto border focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <div className="sticky top-0 z-10 mb-2 bg-white dark:bg-gray-700">
                                        <input
                                            type="text"
                                            placeholder="Search company size..."
                                            value={searchCompanySize}
                                            onChange={(e) => setSearchCompanySize(e.target.value)}
                                            className="mb-2 w-full rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                                        />
                                    </div>
                                    {companySizes
                                        .filter((cs) => cs.toLowerCase().includes(searchCompanySize.toLowerCase()))
                                        .map((cs, i) => (
                                            <SelectItem
                                                className="cursor-pointer data-[highlighted]:bg-[#CCA6FF]/15 data-[highlighted]:text-deepBlack"
                                                key={i}
                                                value={cs}
                                            >
                                                {cs}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Year(s) of operation */}
                    <div className="relative">
                        <label htmlFor="yearsOfOperation" className="text-sm lg:text-base font-semibold text-darkBlue dark:text-gray-200">
                            Year(s) of operation
                        </label>
                        <div className="mt-2">
                            <Select
                                value={selectedYearsOfOperation}
                                onValueChange={setSelectedYearsOfOperation}
                                onOpenChange={(o) => setOpenYearsOfOperation(o)}
                            >
                                <SelectTrigger
                                    id="yearsOfOperation"
                                    className="flex w-full justify-between rounded-md border border-gray-300 py-2.5 px-3 whitespace-nowrap outline-none focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <SelectValue className="w-full whitespace-nowrap text-gray-400" placeholder="Select a category" />
                                    {openYearsOfOperation ? (
                                        <span className="pointer-events-none absolute right-4 rotate-180 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    ) : (
                                        <span className="pointer-events-none absolute right-4 transform">
                                            <img src={images.dropDownSelect} className="h-1.5 w-full" alt="" />
                                        </span>
                                    )}
                                </SelectTrigger>

                                <SelectContent
                                    position="popper"
                                    sideOffset={4}
                                    className="select-dropdown-shadow max-h-60 w-[245px] overflow-y-auto border focus:ring-0 focus:ring-offset-0 [&_svg]:hidden"
                                >
                                    <div className="sticky top-0 z-10 mb-2 bg-white dark:bg-gray-700">
                                        <input
                                            type="text"
                                            placeholder="Search years..."
                                            value={searchYearsOfOperation}
                                            onChange={(e) => setSearchYearsOfOperation(e.target.value)}
                                            className="mb-2 w-full rounded-none border-b px-2 py-2 text-sm focus:ring-0 focus:outline-0"
                                        />
                                    </div>
                                    {yearsOfOperationOptions
                                        .filter((yo) => yo.toLowerCase().includes(searchYearsOfOperation.toLowerCase()))
                                        .map((yo, i) => (
                                            <SelectItem
                                                className="cursor-pointer data-[highlighted]:bg-[#CCA6FF]/15 data-[highlighted]:text-deepBlack"
                                                key={i}
                                                value={yo}
                                            >
                                                {yo}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Active filters display */}
                {hasActiveFilters && (
                    <div className="mb-4 flex flex-wrap gap-2 px-1">
                        {selectedCountry && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                                {selectedCountry}
                                <button onClick={() => setSelectedCountry('')} className="ml-1 hover:text-red-500">×</button>
                            </span>
                        )}
                        {selectedIndustry && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                                {selectedIndustry}
                                <button onClick={() => setSelectedIndustry('')} className="ml-1 hover:text-red-500">×</button>
                            </span>
                        )}
                        {selectedPosition && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                                {selectedPosition}
                                <button onClick={() => setSelectedPosition('')} className="ml-1 hover:text-red-500">×</button>
                            </span>
                        )}
                        {selectedCompanyType && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                                {selectedCompanyType}
                                <button onClick={() => setSelectedCompanyType('')} className="ml-1 hover:text-red-500">×</button>
                            </span>
                        )}
                        {selectedCompanySize && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                                {selectedCompanySize}
                                <button onClick={() => setSelectedCompanySize('')} className="ml-1 hover:text-red-500">×</button>
                            </span>
                        )}
                        {selectedYearsOfOperation && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#CCA6FF]/20 px-3 py-1 text-xs text-deepBlack">
                                {selectedYearsOfOperation}
                                <button onClick={() => setSelectedYearsOfOperation('')} className="ml-1 hover:text-red-500">×</button>
                            </span>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3 px-1">
                    <Button
                        disabled={isApplyingFilters}
                        className="w-full rounded-full py-5 lg:py-6 text-[12px] lg:text-base font-semibold text-white shadow-lg md:text-base lg:text-lg disabled:opacity-70"
                        style={{ backgroundColor: '#193E47' }}
                    >
                        {isApplyingFilters ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Applying...
                            </span>
                        ) : (
                            'Search'
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
