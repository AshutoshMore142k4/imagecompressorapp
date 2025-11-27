'use client';

import { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { PDFDocument, degrees } from 'pdf-lib';
import { formatFileSize, validateFileSize, validateFileType, downloadFile, createFileFromBlob } from '@/lib/utils';
import { Download, RotateCw, FileText } from 'lucide-react';

export default function RotatePDF() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [rotatedFile, setRotatedFile] = useState<File | null>(null);
    const [rotation, setRotation] = useState(90);
    const [pageCount, setPageCount] = useState(0);

    const handleFileSelected = useCallback(async (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (selectedFile && validateFileSize(selectedFile, 100) && validateFileType(selectedFile, ['application/pdf'])) {
            setFile(selectedFile);
            setRotatedFile(null);
            
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setPageCount(pdf.getPageCount());
            } catch (error) {
                console.error('Failed to load PDF:', error);
            }
        }
    }, []);

    const handleRotate = useCallback(async () => {
        if (!file) return;

        setProcessing(true);
        setProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            pages.forEach((page, index) => {
                page.setRotation(degrees(rotation));
                setProgress(((index + 1) / pages.length) * 100);
            });

            const rotatedPdfBytes = await pdfDoc.save();
            const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
            const rotatedPdfFile = createFileFromBlob(blob, `rotated_${file.name}`, 'application/pdf');
            
            setRotatedFile(rotatedPdfFile);
        } catch (error) {
            console.error('Rotation failed:', error);
        }

        setProcessing(false);
    }, [file, rotation]);

    const handleDownload = useCallback(() => {
        if (rotatedFile) {
            downloadFile(rotatedFile);
        }
    }, [rotatedFile]);

    return (
        <div className="space-y-6">
            <FileUpload
                onFilesSelected={handleFileSelected}
                accept=".pdf"
                multiple={false}
                label="Select a PDF file to rotate"
            />

            {file && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-4">
                            <span className="font-semibold text-gray-900">{file.name}</span> • {pageCount} pages
                        </p>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Rotation angle:
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {[90, 180, 270, 360].map((angle) => (
                                    <button
                                        key={angle}
                                        onClick={() => setRotation(angle)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                            rotation === angle
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <RotateCw 
                                            className={`w-6 h-6 ${rotation === angle ? 'text-blue-600' : 'text-gray-600'}`}
                                            style={{ transform: `rotate(${angle}deg)` }}
                                        />
                                        <span className={`text-sm font-medium ${rotation === angle ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {angle}°
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRotate}
                        disabled={processing}
                        className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {processing ? 'Rotating...' : `Rotate ${rotation}°`}
                    </button>
                </div>
            )}

            {processing && (
                <div className="space-y-2">
                    <ProgressBar progress={progress} />
                    <p className="text-sm text-center text-gray-600">Rotating PDF pages...</p>
                </div>
            )}

            {rotatedFile && !processing && (
                <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">PDF Rotated Successfully!</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Rotated {rotation}° • {formatFileSize(rotatedFile.size)}
                            </p>
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download Rotated PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
