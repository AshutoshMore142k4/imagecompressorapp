'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { PDFDocument } from 'pdf-lib';
import { formatFileSize, validateFileSize, validateFileType, downloadFile, createFileFromBlob } from '@/lib/utils';
import { Download, FileText, Scissors } from 'lucide-react';
import JSZip from 'jszip';

export default function SplitPDF() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [splitPages, setSplitPages] = useState<File[]>([]);
    const [splitMode, setSplitMode] = useState<'all' | 'range'>('all');
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(1);

    const handleFileSelected = useCallback(async (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (selectedFile && validateFileSize(selectedFile, 100) && validateFileType(selectedFile, ['application/pdf'])) {
            setFile(selectedFile);
            setSplitPages([]);
            
            // Get page count
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const count = pdf.getPageCount();
                setPageCount(count);
                setRangeEnd(count);
            } catch (error) {
                console.error('Failed to load PDF:', error);
            }
        }
    }, []);

    const handleSplit = useCallback(async () => {
        if (!file) return;

        setProcessing(true);
        setProgress(0);
        const pages: File[] = [];

        try {
            const arrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer);
            const totalPages = sourcePdf.getPageCount();

            const startPage = splitMode === 'all' ? 0 : rangeStart - 1;
            const endPage = splitMode === 'all' ? totalPages : rangeEnd;

            for (let i = startPage; i < endPage; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
                newPdf.addPage(copiedPage);

                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const pageFile = createFileFromBlob(blob, `page_${i + 1}.pdf`, 'application/pdf');
                pages.push(pageFile);

                setProgress(((i - startPage + 1) / (endPage - startPage)) * 100);
            }

            setSplitPages(pages);
        } catch (error) {
            console.error('Split failed:', error);
        }

        setProcessing(false);
    }, [file, splitMode, rangeStart, rangeEnd]);

    const handleDownloadAll = useCallback(async () => {
        if (splitPages.length === 0) return;

        const zip = new JSZip();
        splitPages.forEach((page, index) => {
            zip.file(page.name, page);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const zipFile = createFileFromBlob(blob, 'split_pages.zip', 'application/zip');
        downloadFile(zipFile);
    }, [splitPages]);

    const handleDownloadSingle = useCallback((page: File) => {
        downloadFile(page);
    }, []);

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFileSelected}
                accept=".pdf"
                multiple={false}
                label="Select a PDF file to split"
            />

            {file && pageCount > 0 && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                            <span className="font-semibold text-gray-900">{file.name}</span> • {pageCount} pages
                        </p>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={splitMode === 'all'}
                                    onChange={() => setSplitMode('all')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-900">Split all pages into separate PDFs</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={splitMode === 'range'}
                                    onChange={() => setSplitMode('range')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-900">Split page range</span>
                            </label>

                            {splitMode === 'range' && (
                                <div className="flex items-center gap-3 ml-6">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600">From:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={pageCount}
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1)))}
                                            className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600">To:</label>
                                        <input
                                            type="number"
                                            min={rangeStart}
                                            max={pageCount}
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(Math.max(rangeStart, Math.min(pageCount, parseInt(e.target.value) || pageCount)))}
                                            className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSplit}
                        disabled={processing}
                        className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {processing ? 'Splitting...' : 'Split PDF'}
                    </button>
                </div>
            )}

            {processing && (
                <div className="space-y-2">
                    <ProgressBar progress={progress} />
                    <p className="text-sm text-center text-gray-600">Splitting PDF pages...</p>
                </div>
            )}

            {splitPages.length > 0 && !processing && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{splitPages.length} pages extracted</h4>
                        <button
                            onClick={handleDownloadAll}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download All as ZIP
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {splitPages.map((page, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <Scissors className="w-5 h-5 text-blue-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{page.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(page.size)}</p>
                                </div>
                                <button
                                    onClick={() => handleDownloadSingle(page)}
                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4 text-blue-600" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
