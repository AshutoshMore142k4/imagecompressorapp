'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { pdfToImages, zipFiles } from '@/lib/pdfProcessor';
import { validateFileSize, validateFileType, downloadFile } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function PDFToImage() {
    const [file, setFile] = useState<File | null>(null);
    const [dpi, setDpi] = useState(150);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [images, setImages] = useState<File[]>([]);

    const handleFileSelected = useCallback((selectedFiles: File[]) => {
        const validFile = selectedFiles.find(
            (f) => validateFileSize(f) && validateFileType(f, ['application/pdf'])
        );
        if (validFile) {
            setFile(validFile);
            setImages([]);
        }
    }, []);

    const handleConvert = useCallback(async () => {
        if (!file) return;

        setProcessing(true);
        setProgress(0);

        try {
            const convertedImages = await pdfToImages(file, { dpi });
            setImages(convertedImages);
            setProgress(100);
        } catch (error) {
            alert('Failed to convert PDF. Please try again.');
        }

        setProcessing(false);
    }, [file, dpi]);

    const handleDownloadAll = useCallback(async () => {
        if (images.length === 0) return;

        if (images.length === 1) {
            downloadFile(images[0]);
        } else {
            const zipFile = await zipFiles(images, 'pdf_pages.zip');
            downloadFile(zipFile);
        }
    }, [images]);

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
                        <label htmlFor="dpi-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Output Quality (DPI)
                        </label>
                        <select
                            id="dpi-select"
                            value={dpi}
                            onChange={(e) => setDpi(Number(e.target.value))}
                            disabled={processing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={72}>72 DPI (Screen)</option>
                            <option value={150}>150 DPI (Standard)</option>
                            <option value={300}>300 DPI (High Quality)</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Selected PDF:</span> {file.name}
                        </p>
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? 'Converting...' : 'Convert to Images'}
                    </button>

                    {processing && <ProgressBar progress={progress} label="Converting PDF pages..." />}
                </div>
            )}

            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700">
                            Converted Images ({images.length} {images.length === 1 ? 'page' : 'pages'})
                        </h3>
                        <button
                            onClick={handleDownloadAll}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download {images.length > 1 ? 'as ZIP' : ''}
                        </button>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            ✓ Successfully converted {images.length} page{images.length !== 1 ? 's' : ''} to JPG
                            {images.length > 1 && ' (will be downloaded as ZIP)'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
