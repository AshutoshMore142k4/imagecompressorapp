'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { convertImageFormat } from '@/lib/imageProcessor';
import { validateFileSize, validateFileType, downloadFile, formatFileSize } from '@/lib/utils';
import { Download } from 'lucide-react';
import type { ImageFormat } from '@/types';

export default function FormatConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
    const [quality, setQuality] = useState(80);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<File | null>(null);

    const handleFileSelected = useCallback((selectedFiles: File[]) => {
        const validFile = selectedFiles.find(
            (f) => validateFileSize(f) && validateFileType(f, ['image/'])
        );
        if (validFile) {
            setFile(validFile);
            setResult(null);
        }
    }, []);

    const handleConvert = useCallback(async () => {
        if (!file) return;

        setProcessing(true);
        setProgress(0);

        try {
            const converted = await convertImageFormat(file, targetFormat, quality);
            setResult(converted);
            setProgress(100);
        } catch (error) {
            alert('Failed to convert image. Please try again.');
        }

        setProcessing(false);
    }, [file, targetFormat, quality]);

    const handleDownload = useCallback(() => {
        if (result) {
            downloadFile(result);
        }
    }, [result]);

    const isLossyFormat = targetFormat === 'jpeg' || targetFormat === 'webp' || targetFormat === 'avif';

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFileSelected}
                accept="image/*"
                multiple={false}
                disabled={processing}
            />

            {file && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="target-format" className="block text-sm font-medium text-gray-700 mb-2">
                            Convert To
                        </label>
                        <select
                            id="target-format"
                            value={targetFormat}
                            onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                            disabled={processing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="jpeg">JPG (JPEG)</option>
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                            <option value="avif">AVIF</option>
                        </select>
                    </div>

                    {isLossyFormat && (
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
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">Selected Image:</span> {file.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Size:</span> {formatFileSize(file.size)}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Type:</span> {file.type}
                        </p>
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? 'Converting...' : `Convert to ${targetFormat.toUpperCase()}`}
                    </button>

                    {processing && <ProgressBar progress={progress} label="Converting image..." />}
                </div>
            )}

            {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-green-800 mb-1">Conversion Successful!</p>
                            <p className="text-sm text-green-700">
                                {result.name} • {formatFileSize(result.size)}
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
