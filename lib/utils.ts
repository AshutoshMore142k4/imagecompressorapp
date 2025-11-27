import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const calculateCompressionRatio = (original: number, compressed: number): number => {
    return Math.round(((original - compressed) / original) * 100);
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const downloadFile = (file: File, filename?: string): void => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const createFileFromBlob = (blob: Blob, filename: string, type: string): File => {
    return new File([blob], filename, { type });
};

export const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => file.type.includes(type));
};
