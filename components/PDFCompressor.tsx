'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { compressPDF } from '@/lib/pdfProcessor';
import { validateFileSize, validateFileType, downloadFile, formatFileSize } from '@/lib/utils';
import { Download } from 'lucide-react';
import type { CompressionLevel } from '@/types';

export default function PDFCompressor() {
    const [file, setFile] = useState<File | null>(null);
    const [level, setLevel] = useState<CompressionLevel>('medium');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{ file: File; originalSize: number } | null>(null);

    const handleFileSelected = useCallback((selectedFiles: File[]) => {
        const validFile = selectedFiles.find(
            (f) => validateFileSize(f) && validateFileType(f, ['application/pdf'])
        );
        if (validFile) {
            setFile(validFile);
            setResult(null);
        }
    }, []);

    const handleCompress = useCallback(async () => {
        if (!file) return;

        setProcessing(true);
        setProgress(0);

        try {
            const compressed = await compressPDF(file, level);
            setResult({ file: compressed, originalSize: file.size });
            setProgress(100);
        } catch (error) {
            alert('Failed to compress PDF. Please try again.');
        }

        setProcessing(false);
    }, [file, level]);

    const handleDownload = useCallback(() => {
        if (result) {
            downloadFile(result.file);
        }
    }, [result]);

    const estimatedRatio = level === 'low' ? 10 : level === 'medium' ? 30 : 50;

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFileSelected}
                accept="application/pdf"
                multiple={false}
                disabled={processing}
            />

            {file && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="compression-level" className="block text-sm font-medium text-gray-700 mb-2">
                            Compression Level
                        </label>
                        <select
                            id="compression-level"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as CompressionLevel)}
                            disabled={processing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="low">Low (High Quality, ~10% reduction)</option>
                            <option value="medium">Medium (Balanced, ~30% reduction)</option>
                            <option value="high">High (Max Compression, ~50% reduction)</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">Selected PDF:</span> {file.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Original Size:</span> {formatFileSize(file.size)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Estimated compressed size: ~{formatFileSize(file.size * (1 - estimatedRatio / 100))}
                        </p>
                    </div>

                    <button
                        onClick={handleCompress}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? 'Compressing...' : 'Compress PDF'}
                    </button>

                    {processing && <ProgressBar progress={progress} label="Compressing PDF..." />}
                </div>
            )}

            {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-semibold text-green-800 mb-1">PDF Compressed Successfully!</p>
                            <div className="text-sm text-green-700 space-y-1">
                                <p>Original: {formatFileSize(result.originalSize)}</p>
                                <p>Compressed: {formatFileSize(result.file.size)}</p>
                                <p className="font-semibold">
                                    Saved: {Math.round(((result.originalSize - result.file.size) / result.originalSize) * 100)}%
                                </p>
                            </div>
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
