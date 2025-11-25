'use client';

import { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    accept: string;
    multiple?: boolean;
    maxFiles?: number;
    disabled?: boolean;
}

export default function FileUpload({
    onFilesSelected,
    accept,
    multiple = false,
    maxFiles = 10,
    disabled = false,
}: FileUploadProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (disabled) return;

            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.slice(0, maxFiles);
            onFilesSelected(validFiles);
        },
        [onFilesSelected, maxFiles, disabled]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;
            const files = Array.from(e.target.files || []);
            const validFiles = files.slice(0, maxFiles);
            onFilesSelected(validFiles);
        },
        [onFilesSelected, maxFiles, disabled]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${disabled
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                }`}
        >
            <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
                disabled={disabled}
                className="hidden"
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                className={`flex flex-col items-center gap-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <Upload className={`w-16 h-16 ${disabled ? 'text-gray-400' : 'text-blue-500'}`} />
                <div>
                    <p className="text-lg font-semibold text-gray-700">
                        Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max 50MB per file
                    </p>
                </div>
            </label>
        </div>
    );
}
