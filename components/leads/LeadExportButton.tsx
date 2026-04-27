import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Simple toast notification function
const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
    console.log(`[${variant || 'info'}] ${title}: ${description || ''}`);
};

interface LeadExportButtonProps {
    type?: 'all' | 'person' | 'company';
}

export function LeadExportButton({ type = 'all' }: LeadExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'xlsx' | 'csv') => {
        setIsExporting(true);

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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    className="gap-2"
                >
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
