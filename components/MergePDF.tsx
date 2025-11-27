'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { PDFDocument } from 'pdf-lib';
import { formatFileSize, validateFileSize, validateFileType, downloadFile, createFileFromBlob } from '@/lib/utils';
import { Download, FileText, ArrowUpDown } from 'lucide-react';

export default function MergePDF() {
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mergedFile, setMergedFile] = useState<File | null>(null);

    const handleFilesSelected = useCallback((selectedFiles: File[]) => {
        const validFiles = selectedFiles.filter(
            (file) => validateFileSize(file, 100) && validateFileType(file, ['application/pdf'])
        );
        setFiles(validFiles);
        setMergedFile(null);
    }, []);

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newFiles = [...files];
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
        setFiles(newFiles);
    };

    const moveDown = (index: number) => {
        if (index === files.length - 1) return;
        const newFiles = [...files];
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        setFiles(newFiles);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleMerge = useCallback(async () => {
        if (files.length < 2) return;

        setProcessing(true);
        setProgress(0);

        try {
            const mergedPdf = await PDFDocument.create();

            for (let i = 0; i < files.length; i++) {
                const fileBytes = await files[i].arrayBuffer();
                const pdf = await PDFDocument.load(fileBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                setProgress(((i + 1) / files.length) * 100);
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const file = createFileFromBlob(blob, 'merged.pdf', 'application/pdf');
            
            setMergedFile(file);
        } catch (error) {
            console.error('Merge failed:', error);
        }

        setProcessing(false);
    }, [files]);

    const handleDownload = useCallback(() => {
        if (mergedFile) {
            downloadFile(mergedFile);
        }
    }, [mergedFile]);

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFilesSelected}
                accept=".pdf"
                multiple
                label="Select PDF files to merge"
            />

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {files.length} PDF{files.length > 1 ? 's' : ''} selected
                        </h3>
                        <button
                            onClick={handleMerge}
                            disabled={processing || files.length < 2}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {processing ? 'Merging...' : 'Merge PDFs'}
                        </button>
                    </div>

                    {files.length < 2 && (
                        <p className="text-sm text-amber-600">Please select at least 2 PDF files to merge</p>
                    )}

                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30"
                                        title="Move up"
                                    >
                                        <ArrowUpDown className="w-4 h-4 rotate-180" />
                                    </button>
                                    <button
                                        onClick={() => moveDown(index)}
                                        disabled={index === files.length - 1}
                                        className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30"
                                        title="Move down"
                                    >
                                        <ArrowUpDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1.5 hover:bg-red-100 text-red-600 rounded ml-2"
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {processing && (
                <div className="space-y-2">
                    <ProgressBar progress={progress} />
                    <p className="text-sm text-center text-gray-600">Merging PDFs...</p>
                </div>
            )}

            {mergedFile && !processing && (
                <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">PDF Merged Successfully!</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Combined {files.length} PDFs • {formatFileSize(mergedFile.size)}
                            </p>
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download Merged PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
