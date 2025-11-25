'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { compressImage } from '@/lib/imageProcessor';
import { formatFileSize, validateFileSize, validateFileType, downloadFile } from '@/lib/utils';
import { Download, FileImage } from 'lucide-react';
import type { ProcessingResult } from '@/types';

export default function ImageCompressor() {
    const [files, setFiles] = useState<File[]>([]);
    const [quality, setQuality] = useState(80);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<ProcessingResult[]>([]);

    const handleFilesSelected = useCallback((selectedFiles: File[]) => {
        const validFiles = selectedFiles.filter(
            (file) =>
                validateFileSize(file) &&
                validateFileType(file, ['image/jpeg', 'image/png', 'image/webp'])
        );
        setFiles(validFiles);
        setResults([]);
    }, []);

    const handleCompress = useCallback(async () => {
        if (files.length === 0) return;

        setProcessing(true);
        setProgress(0);
        const newResults: ProcessingResult[] = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const result = await compressImage(files[i], { quality });
                newResults.push(result);
                setProgress(((i + 1) / files.length) * 100);
            } catch (error) {
                // Skip failed files
            }
        }

        setResults(newResults);
        setProcessing(false);
    }, [files, quality]);

    const handleDownload = useCallback((result: ProcessingResult) => {
        downloadFile(result.file);
    }, []);

    const handleDownloadAll = useCallback(() => {
        results.forEach((result) => {
            downloadFile(result.file);
        });
    }, [results]);

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFilesSelected}
                accept="image/jpeg,image/png,image/webp"
                multiple
                maxFiles={10}
                disabled={processing}
            />

            {files.length > 0 && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="quality-slider" className="block text-sm font-medium text-gray-700 mb-2">
                            Quality: {quality}%
                        </label>
                        <input
                            id="quality-slider"
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            disabled={processing}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Selected Files ({files.length})</h3>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                    <FileImage className="w-4 h-4 text-blue-500" />
                                    <span className="flex-1 truncate">{file.name}</span>
                                    <span className="text-gray-500">{formatFileSize(file.size)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCompress}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? 'Compressing...' : 'Compress Images'}
                    </button>

                    {processing && <ProgressBar progress={progress} label="Processing images..." />}
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700">Results</h3>
                        <button
                            onClick={handleDownloadAll}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Download All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {results.map((result, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-800 truncate flex-1">
                                        {result.file.name}
                                    </span>
                                    <button
                                        onClick={() => handleDownload(result)}
                                        className="ml-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Original: {formatFileSize(result.originalSize)}</span>
                                    <span>→</span>
                                    <span>Compressed: {formatFileSize(result.compressedSize)}</span>
                                    <span className="ml-auto font-semibold text-green-700">
                                        {result.compressionRatio}% smaller
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
