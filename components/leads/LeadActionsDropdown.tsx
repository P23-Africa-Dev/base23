import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2, MoreVertical, FileUp, FileDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Simple toast notification function
const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
    console.log(`[${variant || 'info'}] ${title}: ${description || ''}`);
};

interface LeadActionsDropdownProps {
    type?: 'all' | 'person' | 'company';
    onImportClick: () => void;
}

export function LeadActionsDropdown({ type = 'all', onImportClick }: LeadActionsDropdownProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExport = async (format: 'xlsx' | 'csv') => {
        setIsExporting(true);
        setIsOpen(false);

        try {
            const params = new URLSearchParams();
            params.append('format', format);
            if (type !== 'all') {
                params.append('type', type);
            }

            const response = await fetch(`/api/leads/export?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_export_${type}_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Export Complete', `Leads exported as ${format.toUpperCase()} file.`);
        } catch (error) {
            showToast('Export Failed', 'Failed to export leads. Please try again.', 'destructive');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        setIsOpen(false);
        onImportClick();
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <Button
                variant="ghost"
                size="icon"
                disabled={isExporting}
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 w-9 rounded-full bg-white hover:bg-gray-100 shadow-md"
            >
                {isExporting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <MoreVertical className="h-5 w-5" />
                )}
                <span className="sr-only">Import/Export Leads</span>
            </Button>

            {/* Popup Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-xl z-[99999]"
                    style={{ minWidth: '200px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">Manage Leads</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Import Option */}
                    <div className="p-1">
                        <button
                            onClick={handleImportClick}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            <FileUp className="h-4 w-4 text-blue-600" />
                            Import Leads
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mx-2" />

                    {/* Export Options */}
                    <div className="px-3 py-1.5">
                        <span className="text-xs font-medium text-gray-400 uppercase">
                            Export {type !== 'all' ? type.charAt(0).toUpperCase() + type.slice(1) + 's' : 'All'}
                        </span>
                    </div>
                    <div className="p-1 pb-2">
                        <button
                            onClick={() => handleExport('xlsx')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Export as XLSX
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-700 transition-colors"
                        >
                            <FileDown className="h-4 w-4 text-orange-600" />
                            Export as CSV
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
