import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TAG_CATEGORIES, searchTags } from '@/data/smart-match-tags';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { Plus, X, Edit3, Check, Search, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';

interface User {
    id: number;
    company_name?: string;
    company_description?: string;
    industry?: string;
    categories?: string | string[];
    great_at?: string | string[];
    can_help_with?: string | string[];
    tags?: string | string[];
    years_of_operation?: string;
    number_of_employees?: string;
    goals?: string;
}

interface CompanyProfileTabProps {
    user: User;
}

type CompanyProfileForm = {
    company_description: string;
    industry: string;
    categories: string[];
    great_at: string[];
    can_help_with: string[];
    tags: string[];
    years_of_operation: string;
    number_of_employees: string;
    goals: string;
};

const INDUSTRIES = [
    'Technology & Digital Services',
    'Financial & Professional Services',
    'Manufacturing & Industrial',
    'Healthcare & Pharmaceuticals',
    'Energy & Utilities',
    'Retail & Consumer Goods',
    'Logistics & Transportation',
    'Agriculture & Food Processing',
    'Real Estate & Construction',
    'Media & Communications',
    'Education & Training',
    'Government & Public Services',
    'Environmental & Specialized Services',
];

const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const OPERATION_YEARS = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10-20 years', '20+ years'];

const MAX_TAGS = 10;

export default function CompanyProfileTab({ user }: CompanyProfileTabProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newHelpWith, setNewHelpWith] = useState('');
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [selectedTagCategory, setSelectedTagCategory] = useState<string | null>(null);
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    // Helper function to ensure array format
    const ensureArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
        }
        return value;
    };

    const [data, setDataState] = useState<CompanyProfileForm>({
        company_description: user.company_description || '',
        industry: user.industry || '',
        categories: ensureArray(user.categories),
        great_at: ensureArray(user.great_at),
        can_help_with: ensureArray(user.can_help_with),
        tags: ensureArray(user.tags),
        years_of_operation: user.years_of_operation || '',
        number_of_employees: user.number_of_employees || '',
        goals: user.goals || '',
    });
    const setData = (field: keyof CompanyProfileForm | CompanyProfileForm, value?: any) => {
        if (typeof field === 'object') { setDataState(field); return; }
        setDataState((prev) => ({ ...prev, [field]: value }));
    };
    const [errors, setErrors] = useState<Partial<Record<keyof CompanyProfileForm, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    // Tag search results
    const tagSearchResults = useMemo(() => {
        if (tagSearchQuery.trim()) {
            return searchTags(tagSearchQuery, data.tags);
        }
        return [];
    }, [tagSearchQuery, data.tags]);

    // Category tags
    const categoryTags = useMemo(() => {
        if (selectedTagCategory) {
            const category = TAG_CATEGORIES.find((c) => c.name === selectedTagCategory);
            return category ? category.tags.filter((t) => !data.tags.includes(t)) : [];
        }
        return [];
    }, [selectedTagCategory, data.tags]);

    const addTag = (tag: string) => {
        if (data.tags.length < MAX_TAGS && !data.tags.includes(tag)) {
            setData('tags', [...data.tags, tag]);
            setTagSearchQuery('');
        }
    };

    const removeTag = (tag: string) => {
        setData('tags', data.tags.filter((t) => t !== tag));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            await axios.post('/profile/company/update', data);
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
            setIsEditMode(false);
        } catch (err: any) {
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const cancelEdit = () => {
        setData({
            company_description: user.company_description || '',
            industry: user.industry || '',
            categories: ensureArray(user.categories),
            great_at: ensureArray(user.great_at),
            can_help_with: ensureArray(user.can_help_with),
            tags: ensureArray(user.tags),
            years_of_operation: user.years_of_operation || '',
            number_of_employees: user.number_of_employees || '',
            goals: user.goals || '',
        });
        setNewCategory('');
        setNewSkill('');
        setNewHelpWith('');
        setTagSearchQuery('');
        setSelectedTagCategory(null);
        setShowTagDropdown(false);
        setIsEditMode(false);
    };

    const addCategory = () => {
        if (newCategory.trim() && !data.categories.includes(newCategory.trim())) {
            setData('categories', [...data.categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const removeCategory = (category: string) => {
        setData(
            'categories',
            data.categories.filter((c) => c !== category),
        );
    };

    const addSkill = () => {
        if (newSkill.trim() && !data.great_at.includes(newSkill.trim())) {
            setData('great_at', [...data.great_at, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setData(
            'great_at',
            data.great_at.filter((s) => s !== skill),
        );
    };

    const addHelpWith = () => {
        if (newHelpWith.trim() && !data.can_help_with.includes(newHelpWith.trim())) {
            setData('can_help_with', [...data.can_help_with, newHelpWith.trim()]);
            setNewHelpWith('');
        }
    };

    const removeHelpWith = (item: string) => {
        setData(
            'can_help_with',
            data.can_help_with.filter((h) => h !== item),
        );
    };

    return (
        <div className="mx-auto max-w-4xl py-6 pb-20">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="mb-1 text-lg font-semibold text-gray-900">Company Information</h2>
                            <p className="text-sm text-gray-600">
                                {isEditMode ? 'Update your company details and business information.' : 'View your company details and business information.'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!isEditMode ? (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditMode(true)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Edit Company</span>
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={cancelEdit}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Company Name (Read-only) */}
                        <div className="space-y-3">
                            <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                                Company Name
                            </Label>
                            <Input
                                id="company_name"
                                value={user.company_name || 'Not specified'}
                                disabled
                                className="w-full bg-gray-100 text-gray-500"
                            />
                            <p className="text-xs text-gray-500">Company name cannot be changed. Contact support if needed.</p>
                        </div>

                        {/* Company Description */}
                        <div className="space-y-3">
                            <Label htmlFor="company_description" className="text-sm font-medium text-gray-700">
                                Company Description
                            </Label>
                            <Textarea
                                id="company_description"
                                value={isEditMode ? data.company_description : user.company_description || 'Not specified'}
                                onChange={(e) => setData('company_description', e.target.value)}
                                readOnly={!isEditMode}
                                placeholder="Describe your company, its mission, and what it does..."
                                rows={4}
                                className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600 resize-none' : ''}`}
                            />
                            {isEditMode && <InputError message={errors.company_description} />}
                        </div>

                        {/* Industry and Company Stats */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="space-y-3">
                                <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                                    Industry
                                </Label>
                                {isEditMode ? (
                                    <Select value={data.industry} onValueChange={(value) => setData('industry', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INDUSTRIES.map((industry) => (
                                                <SelectItem key={industry} value={industry}>
                                                    {industry}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={user.industry || 'Not specified'}
                                        readOnly
                                        className="bg-gray-50 text-gray-600"
                                    />
                                )}
                                {isEditMode && <InputError message={errors.industry} />}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="years_of_operation" className="text-sm font-medium text-gray-700">
                                    Years of Operation
                                </Label>
                                {isEditMode ? (
                                    <Select value={data.years_of_operation} onValueChange={(value) => setData('years_of_operation', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OPERATION_YEARS.map((year) => (
                                                <SelectItem key={year} value={year}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={user.years_of_operation || 'Not specified'}
                                        readOnly
                                        className="bg-gray-50 text-gray-600"
                                    />
                                )}
                                {isEditMode && <InputError message={errors.years_of_operation} />}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="number_of_employees" className="text-sm font-medium text-gray-700">
                                    Number of Employees
                                </Label>
                                {isEditMode ? (
                                    <Select value={data.number_of_employees} onValueChange={(value) => setData('number_of_employees', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EMPLOYEE_RANGES.map((range) => (
                                                <SelectItem key={range} value={range}>
                                                    {range}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={user.number_of_employees || 'Not specified'}
                                        readOnly
                                        className="bg-gray-50 text-gray-600"
                                    />
                                )}
                                {isEditMode && <InputError message={errors.number_of_employees} />}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">Categories</Label>
                            <div className="mb-3 flex flex-wrap gap-2">
                                {(isEditMode ? data.categories : ensureArray(user.categories)).map((category, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {category}
                                        {isEditMode && (
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(category)}
                                                className="ml-1 text-gray-500 hover:text-gray-700"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                                {(isEditMode ? data.categories : ensureArray(user.categories)).length === 0 && (
                                    <span className="text-gray-500 text-sm italic">No categories specified</span>
                                )}
                            </div>
                            {isEditMode && (
                                <div className="flex gap-2">
                                    <Input
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Add a category..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addCategory} variant="outline" size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {isEditMode && <InputError message={errors.categories} />}
                        </div>

                        {/* Great At */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">What We're Great At</Label>
                            <div className="mb-3 flex flex-wrap gap-2">
                                {(isEditMode ? data.great_at : ensureArray(user.great_at)).map((skill, index) => (
                                    <Badge key={index} variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                                        {skill}
                                        {isEditMode && (
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="ml-1 text-green-600 hover:text-green-800"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                                {(isEditMode ? data.great_at : ensureArray(user.great_at)).length === 0 && (
                                    <span className="text-gray-500 text-sm italic">No skills specified</span>
                                )}
                            </div>
                            {isEditMode && (
                                <div className="flex gap-2">
                                    <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add a skill or expertise..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addSkill} variant="outline" size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {isEditMode && <InputError message={errors.great_at} />}
                        </div>

                        {/* Can Help With */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">Can Help With</Label>
                            <div className="mb-3 flex flex-wrap gap-2">
                                {(isEditMode ? data.can_help_with : ensureArray(user.can_help_with)).map((item, index) => (
                                    <Badge key={index} variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                                        {item}
                                        {isEditMode && (
                                            <button
                                                type="button"
                                                onClick={() => removeHelpWith(item)}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                                {(isEditMode ? data.can_help_with : ensureArray(user.can_help_with)).length === 0 && (
                                    <span className="text-gray-500 text-sm italic">No help topics specified</span>
                                )}
                            </div>
                            {isEditMode && (
                                <div className="flex gap-2">
                                    <Input
                                        value={newHelpWith}
                                        onChange={(e) => setNewHelpWith(e.target.value)}
                                        placeholder="Add something you can help with..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHelpWith())}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addHelpWith} variant="outline" size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {isEditMode && <InputError message={errors.can_help_with} />}
                        </div>

                        {/* Smart Match Tags */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">
                                    Smart Match Tags
                                    <span className="ml-2 text-xs font-normal text-gray-500">
                                        ({data.tags.length}/{MAX_TAGS} selected)
                                    </span>
                                </Label>
                            </div>
                            <p className="text-xs text-gray-500">
                                Select tags that describe your business expertise and interests for better smart matching.
                            </p>

                            {/* Selected Tags */}
                            <div className="mb-3 flex flex-wrap gap-2">
                                {(isEditMode ? data.tags : ensureArray(user.tags)).map((tag, index) => (
                                    <Badge key={index} variant="default" className="flex items-center gap-1 bg-purple-100 text-purple-800">
                                        {tag}
                                        {isEditMode && (
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 text-purple-600 hover:text-purple-800"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                                {(isEditMode ? data.tags : ensureArray(user.tags)).length === 0 && (
                                    <span className="text-gray-500 text-sm italic">No tags selected</span>
                                )}
                            </div>

                            {/* Tag Selection UI - Only in Edit Mode */}
                            {isEditMode && data.tags.length < MAX_TAGS && (
                                <div className="space-y-4">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            value={tagSearchQuery}
                                            onChange={(e) => setTagSearchQuery(e.target.value)}
                                            placeholder="Search for tags..."
                                            className="pl-10"
                                            onFocus={() => setShowTagDropdown(true)}
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {tagSearchQuery && tagSearchResults.length > 0 && (
                                        <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
                                            <p className="mb-2 text-xs font-medium text-gray-500">Search Results</p>
                                            <div className="flex flex-wrap gap-2">
                                                {tagSearchResults.slice(0, 12).map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => addTag(tag)}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-purple-100 hover:text-purple-700"
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Selector */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowTagDropdown(!showTagDropdown)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <span>{selectedTagCategory || 'Browse by category'}</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showTagDropdown && (
                                            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTagCategory(null);
                                                        setShowTagDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
                                                >
                                                    All Categories
                                                </button>
                                                {TAG_CATEGORIES.map((category) => (
                                                    <button
                                                        key={category.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTagCategory(category.name);
                                                            setShowTagDropdown(false);
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedTagCategory === category.name
                                                            ? 'bg-purple-50 text-purple-700'
                                                            : 'text-gray-700'
                                                            }`}
                                                    >
                                                        {category.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Tags */}
                                    {selectedTagCategory && categoryTags.length > 0 && (
                                        <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
                                            <p className="mb-2 text-xs font-medium text-gray-500">{selectedTagCategory}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {categoryTags.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => addTag(tag)}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-purple-100 hover:text-purple-700"
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEditMode && data.tags.length >= MAX_TAGS && (
                                <p className="text-xs text-amber-600">Maximum of {MAX_TAGS} tags reached. Remove some to add more.</p>
                            )}
                            {isEditMode && <InputError message={errors.tags} />}
                        </div>

                        {/* Company Goals */}
                        <div className="space-y-3">
                            <Label htmlFor="goals" className="text-sm font-medium text-gray-700">
                                Company Goals
                            </Label>
                            <Textarea
                                id="goals"
                                value={isEditMode ? data.goals : user.goals || 'Not specified'}
                                onChange={(e) => setData('goals', e.target.value)}
                                readOnly={!isEditMode}
                                placeholder="What are your company's main goals and objectives?"
                                rows={4}
                                className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600 resize-none' : ''}`}
                            />
                            {isEditMode && <InputError message={errors.goals} />}
                        </div>

                        {/* Submit Button - Only show in edit mode */}
                        {isEditMode && (
                            <div className="flex items-center justify-between border-t border-gray-200 pt-8">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium">Company profile updated successfully!</span>
                                    </div>
                                </Transition>

                                <div className="flex items-center space-x-3">
                                    <Button
                                        type="button"
                                        onClick={cancelEdit}
                                        variant="outline"
                                        disabled={processing}
                                        className="px-6 py-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 flex items-center space-x-2"
                                    >
                                        <Check className="h-4 w-4" />
                                        <span>{processing ? 'Saving...' : 'Save Changes'}</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
