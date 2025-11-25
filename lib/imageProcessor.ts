import imageCompression from 'browser-image-compression';
import type { CompressionOptions, ProcessingResult } from '@/types';
import { createFileFromBlob } from './utils';

export const compressImage = async (
    file: File,
    options: CompressionOptions
): Promise<ProcessingResult> => {
    const compressionOptions = {
        maxSizeMB: options.maxSizeMB || 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        quality: options.quality / 100,
        initialQuality: options.quality / 100,
    };

    const compressedBlob = await imageCompression(file, compressionOptions);
    const compressedFile = createFileFromBlob(
        compressedBlob,
        file.name.replace(/\.[^/.]+$/, '_compressed$&'),
        file.type
    );

    return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: Math.round(((file.size - compressedFile.size) / file.size) * 100),
    };
};

export const convertImageFormat = async (
    file: File,
    targetFormat: 'jpeg' | 'png' | 'webp' | 'avif',
    quality: number = 80
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0);

            const mimeType = `image/${targetFormat === 'jpeg' ? 'jpeg' : targetFormat}`;

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image'));
                        return;
                    }

                    const newFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`);
                    const newFile = createFileFromBlob(blob, newFileName, mimeType);
                    resolve(newFile);
                },
                mimeType,
                quality / 100
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};
