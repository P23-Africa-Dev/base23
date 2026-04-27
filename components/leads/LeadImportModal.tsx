import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, Upload, X, CheckCircle, AlertCircle, RotateCcw, FileUp, Check } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

// Simple toast notification function
const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
    console.log(`[${variant || 'info'}] ${title}: ${description || ''}`);
    // You can replace this with your preferred toast library
};

// Progress stages for import
type ImportStage = 'uploading' | 'validating' | 'processing' | 'complete';

const IMPORT_STAGES: { key: ImportStage; label: string; icon: React.ReactNode }[] = [
    { key: 'uploading', label: 'Uploading File', icon: <FileUp className="h-4 w-4" /> },
    { key: 'validating', label: 'Validating Data', icon: <CheckCircle className="h-4 w-4" /> },
    { key: 'processing', label: 'Processing Leads', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { key: 'complete', label: 'Complete', icon: <Check className="h-4 w-4" /> },
];

interface TemplateColumn {
    [key: string]: string;
}

interface SkippedRow {
    row: number;
    data: Record<string, string>;
    reason: string;
    existing_id?: number;
}

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    skipped: SkippedRow[];
    errors: Array<{
        row: number;
        data: Record<string, string>;
        errors: Record<string, string[]>;
    }>;
    total_processed: number;
}

interface LeadImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: () => void;
}

export function LeadImportModal({ isOpen, onClose, onImportComplete }: LeadImportModalProps) {
    const [step, setStep] = useState<'template' | 'upload' | 'importing' | 'result' | 'skipped'>('template');
    const [templatePreview, setTemplatePreview] = useState<{ columns: TemplateColumn; sample_data: Record<string, string>[] } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState<ImportStage>('uploading');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch template preview
    const fetchTemplatePreview = useCallback(async () => {
        try {
            const response = await fetch('/api/leads/template/preview');
            const data = await response.json();
            if (data.success) {
                setTemplatePreview(data);
            }
        } catch (error) {
            console.error('Failed to fetch template preview:', error);
        }
    }, []);

    // Download template
    const downloadTemplate = async (format: 'xlsx' | 'csv') => {
        try {
            const response = await fetch(`/api/leads/template/download?format=${format}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lead_import_template.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Template Downloaded', `Template downloaded as ${format.toUpperCase()} file.`);
        } catch (error) {
            showToast('Download Failed', 'Failed to download template. Please try again.', 'destructive');
        }
    };

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv',
            ];
            const allowedExtensions = ['xlsx', 'xls', 'csv'];
            const extension = file.name.split('.').pop()?.toLowerCase();

            if (!allowedExtensions.includes(extension || '')) {
                showToast('Invalid File Type', 'Please upload an Excel (.xlsx, .xls) or CSV file.', 'destructive');
                return;
            }

            setSelectedFile(file);
        }
    };

    // Upload and import file
    const handleImport = async () => {
        if (!selectedFile) return;

        setStep('importing');
        setUploadProgress(0);
        setCurrentStage('uploading');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Stage 1: Uploading
            setCurrentStage('uploading');
            const uploadInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 5, 25));
            }, 100);

            await new Promise(resolve => setTimeout(resolve, 500));
            clearInterval(uploadInterval);
            setUploadProgress(25);

            // Stage 2: Validating
            setCurrentStage('validating');
            const validateInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 5, 50));
            }, 100);

            await new Promise(resolve => setTimeout(resolve, 500));
            clearInterval(validateInterval);
            setUploadProgress(50);

            // Stage 3: Processing
            setCurrentStage('processing');
            const processInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 3, 90));
            }, 150);

            const response = await fetch('/api/leads/import', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            clearInterval(processInterval);

            // Stage 4: Complete
            setCurrentStage('complete');
            setUploadProgress(100);

            const result: ImportResult = await response.json();
            setImportResult(result);

            await new Promise(resolve => setTimeout(resolve, 300));

            if (result.success) {
                if (result.skipped.length > 0) {
                    setStep('skipped');
                } else {
                    setStep('result');
                    showToast('Import Complete', result.message);
                }
            } else {
                setStep('result');
                showToast('Import Failed', result.message, 'destructive');
            }
        } catch (error) {
            setStep('result');
            setImportResult({
                success: false,
                message: 'Import failed. Please try again.',
                imported: 0,
                skipped: [],
                errors: [],
                total_processed: 0,
            });
            showToast('Import Failed', 'An error occurred during import.', 'destructive');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle skipped rows action
    const handleSkippedAction = async (action: 'keep' | 'update' | 'discard') => {
        if (!importResult) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/leads/import/handle-skipped', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action,
                    skipped: importResult.skipped,
                }),
            });

            const result = await response.json();

            if (result.success) {
                showToast('Action Complete', result.message);
                setStep('result');
            } else {
                showToast('Action Failed', result.message || 'Failed to process skipped rows.', 'destructive');
            }
        } catch (error) {
            showToast('Action Failed', 'An error occurred.', 'destructive');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset modal
    const resetModal = () => {
        setStep('template');
        setSelectedFile(null);
        setUploadProgress(0);
        setCurrentStage('uploading');
        setImportResult(null);
    };

    // Close modal
    const handleClose = () => {
        resetModal();
        onClose();
        if (importResult?.success && importResult.imported > 0) {
            onImportComplete?.();
        }
    };

    // Fetch template on open
    useState(() => {
        if (isOpen && !templatePreview) {
            fetchTemplatePreview();
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Import Leads
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'template' && 'Download the template and fill in your leads data before importing.'}
                        {step === 'upload' && 'Select your filled template file to import leads.'}
                        {step === 'importing' && 'Importing leads, please wait...'}
                        {step === 'result' && 'Import complete. See the results below.'}
                        {step === 'skipped' && 'Some leads were skipped. Choose how to handle them.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step: Template */}
                {step === 'template' && (
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h4 className="mb-2 font-medium">Template Format</h4>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Download the template below and fill in the required fields. The email column is required and must be unique.
                            </p>

                            {templatePreview && (
                                <div className="mb-4 overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                        <thead>
                                            <tr className="border-b">
                                                {Object.keys(templatePreview.columns).map((col) => (
                                                    <th key={col} className="px-2 py-1 text-left font-medium text-primary">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="text-muted-foreground italic">
                                                {Object.values(templatePreview.columns).map((desc, i) => (
                                                    <td key={i} className="px-2 py-1 text-xs">
                                                        {desc}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => downloadTemplate('xlsx')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download XLSX
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download CSV
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={() => setStep('upload')}>
                                Continue to Upload
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* Step: Upload */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        <div
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary cursor-pointer"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                            <p className="mb-2 text-sm font-medium">
                                {selectedFile ? selectedFile.name : 'Click to select a file'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supported formats: XLSX, XLS, CSV (max 10MB)
                            </p>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {selectedFile && (
                            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep('template')}>
                                Back
                            </Button>
                            <Button onClick={handleImport} disabled={!selectedFile}>
                                Import Leads
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* Step: Importing */}
                {step === 'importing' && (
                    <div className="space-y-6 py-4">
                        {/* Staged Progress UI */}
                        <div className="space-y-4">
                            {/* Progress Steps */}
                            <div className="flex justify-between items-center relative px-4">
                                {/* Progress Line Background */}
                                <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 -z-10" />
                                {/* Progress Line Filled */}
                                <div
                                    className="absolute top-4 left-8 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 -z-10 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(uploadProgress / 100 * (IMPORT_STAGES.length - 1) / IMPORT_STAGES.length * 100, 100)}%`,
                                        maxWidth: 'calc(100% - 4rem)'
                                    }}
                                />

                                {IMPORT_STAGES.map((stage, index) => {
                                    const stageIndex = IMPORT_STAGES.findIndex(s => s.key === currentStage);
                                    const isCompleted = index < stageIndex;
                                    const isCurrent = stage.key === currentStage;
                                    const isPending = index > stageIndex;

                                    return (
                                        <div key={stage.key} className="flex flex-col items-center z-10">
                                            <div
                                                className={`
                                                    flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                                                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                                                    ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-100 animate-pulse' : ''}
                                                    ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                                                `}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    stage.icon
                                                )}
                                            </div>
                                            <span
                                                className={`
                                                    mt-2 text-xs font-medium text-center max-w-[70px]
                                                    ${isCurrent ? 'text-blue-600' : ''}
                                                    ${isCompleted ? 'text-green-600' : ''}
                                                    ${isPending ? 'text-gray-400' : ''}
                                                `}
                                            >
                                                {stage.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress Bar */}
                            <div className="px-4">
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-300 ease-out rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>{uploadProgress}% complete</span>
                                    <span>{selectedFile?.name}</span>
                                </div>
                            </div>

                            {/* Current Stage Message */}
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center justify-center gap-2 text-blue-700">
                                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="font-medium">
                                        {currentStage === 'uploading' && 'Uploading your file...'}
                                        {currentStage === 'validating' && 'Validating lead data...'}
                                        {currentStage === 'processing' && 'Processing and importing leads...'}
                                        {currentStage === 'complete' && 'Finalizing import...'}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                    Please wait, this may take a moment
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step: Result */}
                {step === 'result' && importResult && (
                    <div className="space-y-6">
                        <div className={`rounded-lg border p-4 ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                {importResult.success ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                )}
                                <h4 className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {importResult.message}
                                </h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-lg border bg-muted/50 p-4 text-center">
                                <p className="text-2xl font-bold text-primary">{importResult.imported}</p>
                                <p className="text-xs text-muted-foreground">Imported</p>
                            </div>
                            <div className="rounded-lg border bg-muted/50 p-4 text-center">
                                <p className="text-2xl font-bold text-yellow-600">{importResult.skipped.length}</p>
                                <p className="text-xs text-muted-foreground">Skipped</p>
                            </div>
                            <div className="rounded-lg border bg-muted/50 p-4 text-center">
                                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                                <p className="text-xs text-muted-foreground">Errors</p>
                            </div>
                        </div>

                        {importResult.errors.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded-lg border bg-red-50 p-4">
                                <h4 className="mb-2 font-medium text-red-800">Errors</h4>
                                {importResult.errors.slice(0, 5).map((error, i) => (
                                    <div key={i} className="mb-2 text-sm">
                                        <span className="font-medium">Row {error.row}:</span>
                                        <ul className="ml-4 list-disc text-xs text-red-600">
                                            {Object.entries(error.errors).map(([field, messages]) => (
                                                <li key={field}>{field}: {(messages as string[]).join(', ')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {importResult.errors.length > 5 && (
                                    <p className="text-xs text-muted-foreground">
                                        And {importResult.errors.length - 5} more errors...
                                    </p>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={resetModal}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Import More
                            </Button>
                            <Button onClick={handleClose}>
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* Step: Skipped */}
                {step === 'skipped' && importResult && (
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <h4 className="font-medium text-yellow-800">
                                    {importResult.skipped.length} leads were skipped (already exist)
                                </h4>
                            </div>
                            <p className="mt-2 text-sm text-yellow-700">
                                {importResult.imported} leads were imported successfully. Choose how to handle the skipped entries:
                            </p>
                        </div>

                        <div className="max-h-60 overflow-y-auto rounded-lg border p-4">
                            <table className="min-w-full text-xs">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-2 py-1 text-left">Row</th>
                                        <th className="px-2 py-1 text-left">Name</th>
                                        <th className="px-2 py-1 text-left">Email</th>
                                        <th className="px-2 py-1 text-left">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importResult.skipped.map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-2 py-1">{item.row}</td>
                                            <td className="px-2 py-1">{item.data.name}</td>
                                            <td className="px-2 py-1">{item.data.email}</td>
                                            <td className="px-2 py-1 text-yellow-600">{item.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h4 className="mb-3 font-medium">Choose an action:</h4>
                            <div className="grid gap-3">
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => handleSkippedAction('keep')}
                                    disabled={isLoading}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <div className="text-left">
                                        <span className="font-medium">Keep existing</span>
                                        <p className="text-xs text-muted-foreground">
                                            Don't update existing leads, discard the imported data
                                        </p>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => handleSkippedAction('update')}
                                    disabled={isLoading}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4 text-blue-600" />
                                    <div className="text-left">
                                        <span className="font-medium">Update existing</span>
                                        <p className="text-xs text-muted-foreground">
                                            Replace existing lead data with the imported data
                                        </p>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => handleSkippedAction('discard')}
                                    disabled={isLoading}
                                >
                                    <X className="mr-2 h-4 w-4 text-red-600" />
                                    <div className="text-left">
                                        <span className="font-medium">Discard all</span>
                                        <p className="text-xs text-muted-foreground">
                                            Ignore skipped entries and complete the import
                                        </p>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
