'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { imagesToPDF } from '@/lib/pdfProcessor';
import { validateFileSize, validateFileType, downloadFile, formatFileSize } from '@/lib/utils';
import { Download, X, GripVertical } from 'lucide-react';
import type { ImageToPDFOptions } from '@/types';

export default function ImageToPDF() {
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultPDF, setResultPDF] = useState<File | null>(null);
    const [options, setOptions] = useState<ImageToPDFOptions>({
        pageSize: 'A4',
        orientation: 'portrait',
        position: 'fit',
        compress: true,
    });

    const handleFilesSelected = useCallback((selectedFiles: File[]) => {
        const validFiles = selectedFiles.filter(
            (file) =>
                validateFileSize(file) &&
                validateFileType(file, ['image/jpeg', 'image/png', 'image/jpg'])
        );
        setFiles(validFiles);
        setResultPDF(null);
    }, []);

    const handleRemoveFile = useCallback((index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleConvert = useCallback(async () => {
        if (files.length === 0) return;

        setProcessing(true);
        setProgress(0);

        try {
            const pdf = await imagesToPDF(files, options);
            setResultPDF(pdf);
            setProgress(100);
        } catch (error) {
            alert('Failed to create PDF. Please try again.');
        }

        setProcessing(false);
    }, [files, options]);

    const handleDownload = useCallback(() => {
        if (resultPDF) {
            downloadFile(resultPDF);
        }
    }, [resultPDF]);

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFilesSelected}
                accept="image/jpeg,image/png,image/jpg"
                multiple
                maxFiles={10}
                disabled={processing}
            />

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-700">Images ({files.length})</h3>
                        </div>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200"
                                >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <span className="flex-1 truncate text-sm">{file.name}</span>
                                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="p-1 hover:bg-red-50 rounded transition-colors"
                                        aria-label="Remove file"
                                    >
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="page-size" className="block text-sm font-medium text-gray-700 mb-2">
                                Page Size
                            </label>
                            <select
                                id="page-size"
                                value={options.pageSize}
                                onChange={(e) =>
                                    setOptions({ ...options, pageSize: e.target.value as 'A4' | 'Letter' })
                                }
                                disabled={processing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="A4">A4</option>
                                <option value="Letter">Letter</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="orientation" className="block text-sm font-medium text-gray-700 mb-2">
                                Orientation
                            </label>
                            <select
                                id="orientation"
                                value={options.orientation}
                                onChange={(e) =>
                                    setOptions({ ...options, orientation: e.target.value as 'portrait' | 'landscape' })
                                }
                                disabled={processing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                            Image Position
                        </label>
                        <select
                            id="position"
                            value={options.position}
                            onChange={(e) =>
                                setOptions({ ...options, position: e.target.value as 'fit' | 'fill' | 'center' })
                            }
                            disabled={processing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="fit">Fit to Page</option>
                            <option value="fill">Fill Page</option>
                            <option value="center">Center</option>
                        </select>
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? 'Creating PDF...' : 'Create PDF'}
                    </button>

                    {processing && <ProgressBar progress={progress} label="Creating PDF..." />}
                </div>
            )}

            {resultPDF && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-green-800 mb-1">PDF Created Successfully!</p>
                            <p className="text-sm text-green-700">
                                {resultPDF.name} • {formatFileSize(resultPDF.size)}
                            </p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
