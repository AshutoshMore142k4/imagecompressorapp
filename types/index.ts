export type FileWithPreview = {
    file: File;
    preview?: string;
    id: string;
};

export type CompressionLevel = 'low' | 'medium' | 'high';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export type PageSize = 'A4' | 'Letter' | 'Custom';

export type Orientation = 'portrait' | 'landscape';

export type ImagePosition = 'fit' | 'fill' | 'center';

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface CompressionOptions {
    quality: number;
    maxSizeMB?: number;
}

export interface PDFConversionOptions {
    dpi: number;
    pageNumbers?: number[];
}

export interface ImageToPDFOptions {
    pageSize: PageSize;
    orientation: Orientation;
    position: ImagePosition;
    compress: boolean;
}

export interface ProcessingResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}
