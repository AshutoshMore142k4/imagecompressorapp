import { PDFDocument } from 'pdf-lib';
import type { PDFConversionOptions, ImageToPDFOptions, CompressionLevel } from '@/types';
import { createFileFromBlob } from './utils';
import JSZip from 'jszip';

export const pdfToImages = async (
    file: File,
    options: PDFConversionOptions
): Promise<File[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const images: File[] = [];

    const pagesToConvert = options.pageNumbers || Array.from({ length: pageCount }, (_, i) => i);

    for (const pageIndex of pagesToConvert) {
        if (pageIndex >= pageCount) continue;

        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();

        const scale = options.dpi / 72;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const imageBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create image'));
            }, 'image/jpeg', 0.95);
        });

        const imageFile = createFileFromBlob(
            imageBlob,
            `page_${pageIndex + 1}.jpg`,
            'image/jpeg'
        );
        images.push(imageFile);
    }

    return images;
};

export const imagesToPDF = async (
    files: File[],
    options: ImageToPDFOptions
): Promise<File> => {
    const pdfDoc = await PDFDocument.create();

    const pageSizes = {
        A4: { width: 595, height: 842 },
        Letter: { width: 612, height: 792 },
        Custom: { width: 595, height: 842 },
    };

    let { width, height } = pageSizes[options.pageSize];

    if (options.orientation === 'landscape') {
        [width, height] = [height, width];
    }

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;

        try {
            if (file.type.includes('png')) {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else if (file.type.includes('jpeg') || file.type.includes('jpg')) {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else {
                continue;
            }

            const page = pdfDoc.addPage([width, height]);
            const imgDims = image.scale(1);

            let drawWidth = width;
            let drawHeight = height;
            let x = 0;
            let y = 0;

            if (options.position === 'fit') {
                const scale = Math.min(width / imgDims.width, height / imgDims.height);
                drawWidth = imgDims.width * scale;
                drawHeight = imgDims.height * scale;
                x = (width - drawWidth) / 2;
                y = (height - drawHeight) / 2;
            } else if (options.position === 'center') {
                drawWidth = imgDims.width;
                drawHeight = imgDims.height;
                x = (width - drawWidth) / 2;
                y = (height - drawHeight) / 2;
            }

            page.drawImage(image, {
                x,
                y,
                width: drawWidth,
                height: drawHeight,
            });
        } catch (error) {
            continue;
        }
    }

    const pdfBytes = await pdfDoc.save();
    return createFileFromBlob(new Blob([new Uint8Array(pdfBytes)]), 'converted.pdf', 'application/pdf');
};

export const compressPDF = async (
    file: File,
    level: CompressionLevel
): Promise<File> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const compressionOptions = {
        low: { imageQuality: 0.9, objectStreams: false },
        medium: { imageQuality: 0.7, objectStreams: true },
        high: { imageQuality: 0.5, objectStreams: true },
    };

    const options = compressionOptions[level];

    const pdfBytes = await pdfDoc.save({
        useObjectStreams: options.objectStreams,
    });

    return createFileFromBlob(
        new Blob([new Uint8Array(pdfBytes)]),
        file.name.replace('.pdf', '_compressed.pdf'),
        'application/pdf'
    );
};

export const zipFiles = async (files: File[], zipName: string = 'files.zip'): Promise<File> => {
    const zip = new JSZip();

    files.forEach((file, index) => {
        zip.file(file.name || `file_${index + 1}`, file);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return createFileFromBlob(zipBlob, zipName, 'application/zip');
};
